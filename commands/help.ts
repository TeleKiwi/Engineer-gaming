import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, Message, PermissionsBitField } from "discord.js";
import { Command } from "../classes/command";
import { Lang } from "../lang/lang";

class HelpCommand extends Command {
    name: string = "help";
    aliases: string[] = ["cmds"];
    description: string = "Shows all of the commands.";

    // --------------------------------------------------------------------- \\
    
    async run(message: Message, language: Lang) {
        let Utils = this.utils;
        let Args = this.getArgs(message.content);

        if (Args[0] == undefined) {
            let description = language.get("useHelp",this.prefix);
            let row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setURL("https://github.com/Hd28br/Engineer-gaming")
                        .setLabel("GitHub")
                        .setStyle(ButtonStyle.Link),
                );

            this.commands.forEach((element: Command) => {
                let canRun = true;
    
                element.permissions.forEach(element => {
                    if (element == "BOT_OWNER") {
                        if (message.author.id != "549099433707569163") canRun = false;
                    } else {
                        if (message.member && !message.member.permissions.has(element)) canRun = false;
                    }
                });
                
                description += `${canRun ? "" : "~~"}\`${element.name}\`${canRun ? "" : "~~"} ${description.split("\n").at(-1).length >= 24 ? "\n" : ""}`;
            });
        
            message.channel.send({ embeds: [Utils.embedGen.Normal("All commands", description)], components: [row] });
        } else {
            let command = Args[0].toLowerCase();
            let foundCommand: any = this.commands.get(command);
            foundCommand = foundCommand == undefined ? this.commands.find((u: any) => u.aliases.includes(command)) : foundCommand;
    
            if (foundCommand) {
                message.channel.send({ embeds: [Utils.embedGen.Normal(this.prefix + Args[0].toLowerCase(), `${this.prefix}${Args[0].toLowerCase()}\nAliases: ${(foundCommand.aliases.length == 0 ? ["None"] : foundCommand.aliases).join(", ")}\nCredits: ${foundCommand.credits.join("")}\n\n${foundCommand.description}`)] });
            } else {
                message.channel.send({ embeds: [Utils.embedGen.Normal(language.get("commandNotFound"))] });
            }
        }
    }

    // --------------------------------------------------------------------- \\

    async runSlash(interaction: CommandInteraction, language: Lang) {
        if (!interaction.isRepliable()) return;
        let Utils = this.utils;

        let description = language.get("useHelp",this.prefix);
        let row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setURL("https://github.com/Hd28br/Engineer-gaming")
                        .setLabel("GitHub")
                        .setStyle(ButtonStyle.Link),
                );

        this.commands.forEach((element: Command) => {
            let canRun = true;

            element.permissions.forEach(element => {
                if (element == "BOT_OWNER") {
                    if (interaction.user.id != "549099433707569163") canRun = false;
                } else {
                    if (interaction.member && !(interaction.member.permissions as PermissionsBitField).has(element)) canRun = false;
                }
            });
            
            description += `${canRun ? "" : "~~"}\`${element.name}\`${canRun ? "" : "~~"} ${description.split("\n").at(-1).length >= 24 ? "\n" : ""}`;
        });
    
        interaction.reply({ embeds: [Utils.embedGen.Normal("All commands", description)], components: [row] });
    }
}

export default HelpCommand;