// ------------ Imports ------------ \\

import { GatewayIntentBits, Collection, Client, Routes, Partials, ActivityType, Webhook } from "discord.js";
import { REST } from "@discordjs/rest";
import dotenv from "dotenv";
import fs from "fs";
import process from "process";

import { Utils } from "./utils/utils";
import { Lang } from "./lang/lang";
import uwuifier from "uwuify";

dotenv.config();

if (process.env.TOKEN == undefined) { // Had to add this because typescript
    Utils.Log("Bot token is is missing!");
    process.exit();
}

Utils.Log("------------------------------------------------");

// ------------ Bot variables ------------ \\

const prefix : string = "engie!";
const presences = require("./presences.json");
let cbug: string[] = [];
const UWU = new uwuifier();

// ------------ Functions ------------ \\

function ShowError(t: Error) {
    Utils.Log("ERROR");
    Utils.Log(t.stack);
}

// ------------ Client ------------ \\

const client: Client = new Client({
    allowedMentions: {
        "repliedUser": true,
    },
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildWebhooks
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction]
});
const rest = new REST({version: "10"}).setToken(process.env.TOKEN);

// ------------ Commands ------------ \\

let Commands = new Collection();
let JSONCommands: any[] = [];

fs.readdirSync("./commands/").filter(f => f.endsWith(".ts")).forEach(element => {
    let command: any = new (require(`./commands/${element}`).default)(client, Utils, prefix, Commands); // Let's go
    Commands.set(command.name,command);
    
    command.init();
    let sc = command.getSlash();
    JSONCommands.push(sc.toJSON());
});
const shutdown = false;

// ------------ Bot events ------------ \\

client.on("ready",async (message) => {
    Utils.Log("I'm ready!");

    client.guilds.cache.forEach(guild => {
        rest.put(Routes.applicationGuildCommands("943698437281562665",guild.id), {body: JSONCommands}).then(() => {
            Utils.Log(`[/] ${guild.name} updated with slash commands`);
        }).catch(() => {
            Utils.Log(`[/X] Failed to update ${guild.name} with slash commands`);
        });
    });

    let type = Utils.RNG.Array(["games","games","music","status"]);
    let chosen = Utils.RNG.Array(presences[type]);

    if (client.user) {
        client.user.setPresence({
            "status": "idle",
            "activities": [{
                "name": chosen + ` | ${prefix}help`,
                "type": (type == "music") ? ActivityType.Listening : ActivityType.Playing
            }]
        });
    }

    if (shutdown) {
        let CanShutdown = true;
        Commands.forEach((element: any) => {
            CanShutdown = CanShutdown && element.shutdownState();
        });

        if (CanShutdown) { // Bye bye
            Utils.Log("Shutting down, bye bye!");
            Utils.currency.save();
            client.destroy();
            process.exit(0);
        }
    }

    setInterval(async () => {
        if (!client.user) return;
        
        let type = Utils.RNG.Array(["games","games","music","status"]);
        let chosen = Utils.RNG.Array(presences[type]);
    
        client.user.setPresence({
            "status": "idle",
            "activities": [{
                "name": chosen + ` | ${prefix}help`,
                "type": (type == "music") ? ActivityType.Listening : ActivityType.Playing
            }]
        });

        if (shutdown) {
            let CanShutdown = true;
            Commands.forEach((element: any) => {
                CanShutdown = CanShutdown && element.shutdownState();
            });

            if (CanShutdown) { // Bye bye
                Utils.Log("Shutting down, bye bye!");
                Utils.currency.save();
                client.destroy();
                process.exit(0);
            }
        }
    },1000 * (60 * 2.5));
});

client.on("interactionCreate", async (interaction) => {
    let language = new Lang("en-us");

    if (interaction.isButton()) {
        Commands.forEach((cmd: any) => {
            if (typeof cmd.button == "function") cmd.button(interaction, language);
        });
    }

    if (interaction.isChatInputCommand()) {
        Utils.Log(`[/] <${interaction.user.tag}> executed \"${interaction.commandName}\"`);
        Promise.resolve().then(async () => {
            let command: any = Commands.get(interaction.commandName);
            command.runSlash(interaction, language).catch((t: Error) => {
                ShowError(t);
                interaction.reply({embeds: [Utils.embedGen.Error(t.toString())]});
            });
        });
    }
});

client.on("guildCreate", (guild) => { 
    Utils.Log(`Joined new guild: ${guild.name}`);

    rest.put(Routes.applicationGuildCommands("943698437281562665",guild.id), {body: JSONCommands}).then(() => {
        Utils.Log(`${guild.name} updated with slash commands`);
    }).catch(() => {
        Utils.Log(`Failed to update ${guild.name} with slash commands`);
    });
});

client.on("messageCreate",async (message) => {
    if (message.author.bot) {
        if (message.author.id == "429305856241172480") message.react("🐌").catch(ShowError); // Reacts every message from esmBot
        return;
    }

    let language = new Lang("en-us");

    if (message.guild) {
        let locale = message.guild.preferredLocale;
        if (locale == "pt-BR") language = new Lang("pt-br");
    }

    let owner = (message.author.id == "549099433707569163") || (message.author.id == "655804021679980560");
    
    if (message.content.toLowerCase().startsWith(prefix)) {
        Utils.Log(`<${message.author.tag}> ${message.content}`);

        let command = message.content.substring(prefix.length).split(/ |\\n/g)[0].toLowerCase();
        let foundCommand: any = Commands.get(command);
        foundCommand = foundCommand == undefined ? Commands.find((u: any) => u.aliases.includes(command)) : foundCommand;

        if (foundCommand != undefined) {
            let canRun: boolean = true;
            
            foundCommand.permissions.forEach((element: any) => {
                if (element == "BOT_OWNER") {
                    if (!owner) canRun = false;
                } else {
                    if (message.member && !message.member.permissions.has(element)) canRun = false;
                }
            });

            if (canRun) {
                if (shutdown) await message.channel.send(language.get("botShutdown"));

                Promise.resolve().then(async () => {
                    foundCommand.run(message, language).catch(async (t: Error) => {
                        ShowError(t);
                        await message.channel.send({embeds: [Utils.embedGen.Error(t.stack)]}).catch(ShowError);
                    });
                });
            } else {
                await message.channel.send({embeds: [Utils.embedGen.Normal(language.get("commandNoPerms"))]}).catch(ShowError);
            }
        } else {
            await message.channel.send({ embeds: [Utils.embedGen.Normal(language.get("commandNotFound"))] }).catch(ShowError);
        }
    } else {
        Commands.forEach((cmd: any) => {
            if (typeof cmd.messageEvent == "function") cmd.messageEvent(message, language);
        });

        if (message.guild && message.guild.id == "866250603508662313") { // The CelLua Machine Server
            if (message.content.includes("attempt to index global 'c' (a nil value)") && cbug.indexOf(message.author.id) == -1) { // Reported over 22 times.
                message.reply(`The Time Generator cell bug has been fixed on the next version
<@549099433707569163> (Reported by ${message.author.tag})`);
                cbug.push(message.author.id);
            }
        }

        if (Utils.RNG.Chance(message.content.length/8000) && message.member && message.content != "") { // We do a little trolling
            Utils.Log("UwU message!!!");
            message.guild?.fetchWebhooks().then((col: Collection<any, any>) => {
                if (!message.member) return; // Oh my god typescript

                let web: Webhook|undefined = col.find((element: Webhook) => element.owner?.id == client.user?.id);

                if (web) {
                    web.edit({
                        "name": UWU.uwuify(message.member.displayName),
                        "avatar": message.member.displayAvatarURL({"extension": "png"}),
                        "reason": "Update",
                        "channel": message.channelId
                    }).then(() => {
                        if (!web) return; // Again bruh

                        message.delete().catch(ShowError);
                        web.send(UWU.uwuify(message.content)).catch(ShowError);
                    }).catch(ShowError);
                } else {
                    message.guild?.channels.createWebhook({
                        "name": UWU.uwuify(message.member.displayName),
                        "avatar": message.member.displayAvatarURL(),
                        "reason": "We do a little trolling",
                        "channel": message.channelId
                    }).then((webhook: Webhook) => {
                        message.delete().catch(ShowError);
                        webhook.send(UWU.uwuify(message.content)).catch(ShowError);
                    }).catch(ShowError);
                }
            }).catch(ShowError);
        }
    }
});

client.login(process.env.TOKEN);