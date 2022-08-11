// ------------ Imports ------------ \\

import { GatewayIntentBits, Collection, Client, Routes, Partials, ActivityType } from "discord.js";
import { REST } from "@discordjs/rest";
import dotenv from "dotenv";
import fs from "fs";
import process from "process";

import { Utils } from "./utils/utils";
import { Lang } from "./lang/lang";

dotenv.config();

if (process.env.TOKEN == undefined) { // Had to add this because typescript
    Utils.Log("Bot token is is missing!");
    process.exit();
}

Utils.Log("------------------------------------------------");

// ------------ Bot variables ------------ \\

const prefix : string = "engie!";
const presences = require("./presences.json");

// ------------ Functions ------------ \\

function ShowError(t: Error) {
    Utils.Log("ERROR");
    Utils.Log(t.toString());
    console.log(t);
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
        GatewayIntentBits.MessageContent
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

    setInterval(async () => {
        if (!client.user) return;
        
        let type = Utils.RNG.Array(["games","games","music","status"]);
        let chosen = Utils.RNG.Array(presences[type]);
    
        client.user.setPresence({
            "status": "idle",
            "activities": [{
                "name": chosen[0] + ` | ${prefix}help`,
                "type": (type == "music") ? ActivityType.Listening : ActivityType.Playing,
                "url": chosen[1]
            }]
        });
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
        if (message.author.id == "429305856241172480") message.react("🐌").catch((e: Error) => {Utils.Log(`Error!!!\n${e.toString()}`,[255,0,0])});
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
                Promise.resolve().then(async () => {
                    foundCommand.run(message, language).catch(async (t: Error) => {
                        ShowError(t);
                        await message.channel.send({embeds: [Utils.embedGen.Error(t.toString())]}).catch(ShowError);
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
    }
});

client.login(process.env.TOKEN);