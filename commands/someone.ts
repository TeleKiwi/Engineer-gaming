import { PermissionsBitField, Message, GuildMember, CommandInteraction } from "discord.js";
import { Command } from "../classes/command";
import { Lang } from "../lang/lang";

class SomeoneCommand extends Command {
    name: string = "someone";
    aliases: string[] = ["somebody"];
    description: string = "Ping a random member from the server.";
    permissions: any[] = [PermissionsBitField.Flags.MentionEveryone];

    async run(message: Message, language: Lang) {
        if (!message.guild) return;
        
        let members = await message.guild.members.fetch();
        let member = members.filter((e: GuildMember) => !e.user.bot).random();
        if (!member) return;
        await message.channel.send(member.toString());
    }

    async runSlash(interaction: CommandInteraction, language: Lang) {
        if (!interaction.isRepliable() || !interaction.guild) return;

        let members = await interaction.guild.members.fetch();
        let member = members.filter((e: GuildMember) => !e.user.bot).random();
        if (!member) return;
        await interaction.reply(member.toString());
    }
}

export default SomeoneCommand;