import { CommandInteraction, Message, SlashCommandBuilder } from "discord.js";
import { Command } from "../classes/command";
import { Lang } from "../lang/lang";

class BalanceCommand extends Command {
    name: string = "balance";
    aliases: string[] = ["bal"];
    description: string = "See how much <:money:995821789466865764> you have.";

    // --------------------------------------------------------------------- \\

    async run(message: Message, language: Lang) {
        let Utils = this.utils;
        
        let member: any = message.mentions.members?.first();
        member = member == undefined ? message.member : member;
        let you = member == message.member;

        if (member == undefined) return;
        message.channel.send({ embeds: [Utils.embedGen.Normal(language.get("balanceTitle"),language.get(you ? "balanceYou" : "balanceThey",you ? [Utils.currency.formatMoney(Utils.currency.balance(member.id)),Utils.currency.data.length-Utils.currency.find(member.id)] : [member.user.username,Utils.currency.formatMoney(Utils.currency.balance(member.id)),Utils.currency.data.length-Utils.currency.find(member.id)]))]});
    }

    // --------------------------------------------------------------------- \\

    getSlash(): any {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description).addMentionableOption(option => option.setName("user").setDescription("The person that you want to check their balance. (Optional)").setRequired(false));
    }

    async runSlash(interaction: CommandInteraction, language: Lang) {
        if (!interaction.isRepliable()) return;
        let Utils = this.utils;

        let member: any = interaction.options.get("user")?.user;
        member = member == undefined ? interaction.user : member;
        let you = member == interaction.user;

        if (member == undefined) return;

        interaction.reply({ embeds: [Utils.embedGen.Normal(language.get("balanceTitle"),language.get(you ? "balanceYou" : "balanceThey",you ? [Utils.currency.formatMoney(Utils.currency.balance(member.id)),Utils.currency.data.length-Utils.currency.find(member.id)] : [member.username,Utils.currency.formatMoney(Utils.currency.balance(member.id)),Utils.currency.data.length-Utils.currency.find(member.id)]))]});
    }
}

export default BalanceCommand;