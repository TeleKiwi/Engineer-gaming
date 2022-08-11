import { CommandInteraction, GuildMember, Message, SlashCommandBuilder } from "discord.js";
import { Command } from "../classes/command";
import { Lang } from "../lang/lang";

function isNumeric(str: string): boolean {
    if (typeof str !== "string") {
        return false;
    }

    if (str.trim() === "") {
        return false;
    }

    return !Number.isNaN(Number(str));
}

class TransferCommand extends Command {
    name: string = "transfer";
    arguments: string = "`@user` `ammount`";
    aliases: string[] = [""];
    description: string = "Transfer your money to someone.";

    async run(message: Message, language: Lang): Promise<any> {
        let Utils = this.utils;
        let Args = this.getArgs(message.content);
        let Mentioned = message.mentions.members?.first();
        
        if (!Mentioned) return message.channel.send({ embeds: [Utils.embedGen.Normal(language.get("commandInvalidArgs"))]});
        if (Mentioned.user.bot) return message.channel.send({ embeds: [Utils.embedGen.Normal(language.get("commandInvalidArgs"))]});
        if (Mentioned.user.id == message.author.id) return message.channel.send({ embeds: [Utils.embedGen.Normal(language.get("commandInvalidArgs"))]});
        if (!isNumeric(Args[Args.length-1])) return message.channel.send({ embeds: [Utils.embedGen.Normal(language.get("commandInvalidArgs"))]});
        if (parseFloat(Args[Args.length-1]) < 0) return message.channel.send({ embeds: [Utils.embedGen.Normal(language.get("commandInvalidArgs"))]});

        let ammount = 100*parseFloat(Args[Args.length-1]);
        if (Utils.currency.transfer(message.author.id,Mentioned?.user.id as string,ammount)) {
            message.channel.send({ embeds: [Utils.embedGen.Normal(language.get("transactionSuccessTitle"),language.get("transactionSuccessDesc",[Utils.currency.formatMoney(ammount),Mentioned?.user.username]))]});
        } else {
            message.channel.send({ embeds: [Utils.embedGen.Normal("Failed",`Failed to transfer the money.`)]});
        }
    }

    getSlash(): any {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description).addMentionableOption(option => option.setName("user").setDescription("The person that you want to transfer your currency to.").setRequired(true)).addNumberOption(option => option.setName("ammount").setDescription("The ammount you want to transfer.").setRequired(true));
    }

    async runSlash(interaction: CommandInteraction, language: Lang): Promise<any> {
        if (!interaction.isRepliable()) return;
        let Utils = this.utils;

        let Mentioned = interaction.options.get("user")?.user;
        let Ammount = interaction.options.get("ammount")?.value as number;

        if (!Mentioned) return;
        if (!Ammount) return;

        if (!Mentioned) return interaction.reply({ embeds: [Utils.embedGen.Normal(language.get("commandInvalidArgs"))]});
        if (Mentioned.bot) return interaction.reply({ embeds: [Utils.embedGen.Normal(language.get("commandInvalidArgs"))]});
        if (Mentioned.id == interaction.user.id) return interaction.reply({ embeds: [Utils.embedGen.Normal(language.get("commandInvalidArgs"))]});
        if (typeof Ammount != "number") return interaction.reply({ embeds: [Utils.embedGen.Normal(language.get("commandInvalidArgs"))]});
        if (Ammount < 0) return interaction.reply({ embeds: [Utils.embedGen.Normal(language.get("commandInvalidArgs"))]});

        Ammount *= 100;        
        if (Utils.currency.transfer(interaction.user.id,Mentioned?.id as string,Ammount)) {
            interaction.reply({ embeds: [Utils.embedGen.Normal(language.get("transactionSuccessTitle"),language.get("transactionSuccessDesc",[Utils.currency.formatMoney(Ammount),Mentioned?.username]))]});
        } else {
            interaction.reply({ embeds: [Utils.embedGen.Normal("Failed",`Failed to transfer the money.`)]});
        }
    }
}

export default TransferCommand;