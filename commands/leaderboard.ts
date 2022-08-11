import { CommandInteraction, Message } from "discord.js";
import { Command } from "../classes/command";
import { Lang } from "../lang/lang";

class LeadearboardCommand extends Command {
    name: string = "leaderboard";
    aliases: string[] = ["lb"];
    description: string = "Show the top 10 people with the most money.";

    // --------------------------------------------------------------------- \\

    async run(message: Message, language: Lang) {
        let Utils = this.utils;
        let Result = "";
        
        if (message.guild) await message.guild.members.fetch();
    
        for (let index = 1; index < Math.min(Utils.currency.data.length,16); index++) {
            const element = Utils.currency.data[(Utils.currency.data.length-1)-index];
            const user = this.client.users.cache.get(element[0]);

            Result += `${index}# ${[":first_place:",":second_place:",":third_place:",":medal:"][Math.min(index-1,3)]} \`${user == undefined ? `########` : user.tag}\`: ${Utils.currency.formatMoney(element[1])}\n`;
        }
    
        message.channel.send({ embeds: [Utils.embedGen.Normal(language.get("leaderboardTitle"),Result)] });
    }

    // --------------------------------------------------------------------- \\

    async runSlash(interaction: CommandInteraction, language: Lang) {
        if (!interaction.isRepliable()) return;
        let Utils = this.utils;
        let Result = "";

        if (interaction.guild) await interaction.guild.members.fetch();
    
        for (let index = 1; index < Math.min(Utils.currency.data.length,16); index++) {
            const element = Utils.currency.data[(Utils.currency.data.length-1)-index];
            const user = this.client.users.cache.get(element[0]);

            Result += `${index}# ${[":first_place:",":second_place:",":third_place:",":medal:"][Math.min(index-1,3)]} \`${user == undefined ? `########` : user.tag}\`: ${Utils.currency.formatMoney(element[1])}\n`;
        }
    
        interaction.reply({ embeds: [Utils.embedGen.Normal(language.get("leaderboardTitle"), Result)] });
    }
}

export default LeadearboardCommand;