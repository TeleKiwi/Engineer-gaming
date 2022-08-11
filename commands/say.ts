import { CommandInteraction, Message, SlashCommandBuilder } from "discord.js";
import { Command } from "../classes/command";
import { Lang } from "../lang/lang";

class SayCommand extends Command {
    name: string = "say";
    arguments: string = "`text`";
    aliases: string[] = [];
    description: string = "Make the bot say somenthing. (Owner only)";
    permissions: any[] = ["BOT_OWNER"];

    // --------------------------------------------------------------------- \\
    
    async run(message: Message, language: Lang) {
        let Args = this.getArgs(message.content);

        if (message.deletable) {
            message.delete();
            message.channel.send(Args.join(" "));
        } else {
            message.channel.send("Can't.");
        }
    }

    getSlash(): any {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description).addStringOption(option => option.setName("text").setDescription("The text for me to say.").setRequired(true));
    }

    // --------------------------------------------------------------------- \\

    async runSlash(interaction: CommandInteraction, language: Lang) {
        if (!interaction.isRepliable()) return;
        if (!interaction.channel) return;
        let Utils = this.utils;
        let text = interaction.options.get("text")?.value as string;

        interaction.channel.send(text).catch((t: Error) => {
            Utils.Log("Epic error!");
            Utils.Log(t.toString());
            interaction.reply({embeds: [Utils.embedGen.Error(t.toString())], ephemeral: true});
        });
    }
}

export default SayCommand;