import { CommandInteraction, Message } from "discord.js";
import { Command } from "../classes/command";
import { Lang } from "../lang/lang";

class PingCommand extends Command {
    name: string = "ping";
    aliases: string[] = ["pong"];
    description: string = "Just replies with pong.";

    // --------------------------------------------------------------------- \\
    
    async run(message: Message, language: Lang) {
        let Utils = this.utils;

        let embed = Utils.embedGen.Normal(":ping_pong: Pong!",language.get("ping",[Date.now() - message.createdTimestamp,Math.round(this.client.ws.ping)]));
        embed.setThumbnail("https://media.discordapp.net/attachments/994602408367886406/999827791765839943/Engineerava.jpg");
        message.channel.send({ embeds: [embed] });
    }

    // --------------------------------------------------------------------- \\

    async runSlash(interaction: CommandInteraction, language: Lang) {
        if (!interaction.isRepliable()) return;
        let Utils = this.utils;

        let embed = Utils.embedGen.Normal(":ping_pong: Pong!",language.get("ping",[Date.now() - interaction.createdTimestamp,Math.round(this.client.ws.ping)]));
        embed.setThumbnail("https://media.discordapp.net/attachments/994602408367886406/999827791765839943/Engineerava.jpg");
        interaction.reply({ embeds: [embed] });
    }
}

export default PingCommand;