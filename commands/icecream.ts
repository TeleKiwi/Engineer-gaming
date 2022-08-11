import { ActionRowBuilder, ActionRowComponent, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, Message, SlashCommandBuilder } from "discord.js";
import { Command } from "../classes/command";
import { Lang } from "../lang/lang";

interface Why {
    [key: string]: any
}

let price = 450;
let flavours: Why = {};
class IcecreamCommand extends Command {
    name: string = "icecream";
    aliases: string[] = [""];
    description: string = "Just replies with pong.";

    // --------------------------------------------------------------------- \\
    
    async run(message: Message, language: Lang) {
        let Utils = this.utils;

        let today = new Date();
    
        let Flavour = this.getArgs(message.content).join(" ");
        Flavour = Flavour.length == 0 ? language.get("icecreamFlavours")[Math.floor(Math.random()*language.get("icecreamFlavours").length)] : (/<@&(\d{17,19})>/g.test(Flavour) ? `\`${Flavour.replace(/\`|\n/g," ")}\`` : Flavour)
    
        if (today.getDay() == 6 || today.getDay() == 0) {
            message.channel.send(`:icecream: Here is your ${Flavour} icecream.\nMessage requested by ${message.author.tag} (${message.author.id})`);
        } else {
            let row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`icecream`)
                        .setLabel("Click here to buy")
                        .setStyle(ButtonStyle.Primary),
                );
    
            let t = await message.channel.send({content: language.get("icecreamBuy",Utils.currency.formatMoney(Utils.currency.discountPrice(message.author.id,price))), components: [row]});
    
            flavours[t.id] = [message.author.id,Flavour,language,setTimeout(() => {
                if (flavours[t.id]) delete flavours[t.id];
            },600000)];
        }
    }

    // --------------------------------------------------------------------- \\

    getSlash(): any {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description).addStringOption(option => option.setName("flavour").setDescription("The flavour of your icecream.").setRequired(false));
    }

    async runSlash(interaction: CommandInteraction, language: Lang) {
        if (!interaction.isRepliable()) return;
        let Utils = this.utils;

        let today = new Date();
    
        let Flavour = interaction.options.get("flavour")?.value as string;
        Flavour = Flavour.length == 0 ? language.get("icecreamFlavours")[Math.floor(Math.random()*language.get("icecreamFlavours").length)] : (/<@&(\d{17,19})>/g.test(Flavour) ? `\`${Flavour.replace(/\`|\n/g," ")}\`` : Flavour)
    
        if (today.getDay() == 6 || today.getDay() == 0) {
            interaction.reply(`:icecream: Here is your ${Flavour} icecream.\nMessage requested by ${interaction.user.tag} (${interaction.user.id})`);
        } else {
            let row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`icecream`)
                        .setLabel("Click here to buy")
                        .setStyle(ButtonStyle.Primary),
                );
    
            let t = await interaction.reply({content: language.get("icecreamBuy",Utils.currency.formatMoney(Utils.currency.discountPrice(interaction.user.id,price))), components: [row]});
            let tid = (await interaction.fetchReply()).id;
    
            flavours[tid] = [interaction.user.id,Flavour,language,setTimeout(() => {
                if (flavours[tid]) delete flavours[tid];
            },600000)];
        }
    }

    // --------------------------------------------------------------------- \\

    async button(interaction: ButtonInteraction, language: Lang) {
        this.utils.Log(`\"${this.name}\" recived an button event ${interaction.message.id}.`);
        
        if (interaction.customId == "icecream" && flavours[interaction.message.id]) {
            let id = flavours[interaction.message.id][0];
            let Utils = this.utils;
            let language = flavours[interaction.message.id][2];
    
            if (interaction.user.id == id) {
                if (Utils.currency.transfer(interaction.user.id,Utils.currency.engineerId,Utils.currency.discountPrice(interaction.user.id,99))) {
                    interaction.update({ content: language.get("icecreamBought",[flavours[interaction.message.id][1],interaction.user.tag,id]), components: [] });
                } else {
                    interaction.update({ content: language.get(flavours[interaction.message.id][2],"cantIcecream"), components: []});
                }
    
                clearTimeout(flavours[interaction.message.id][3]);
                delete flavours[interaction.message.id]; // Avoid memory leaks
            }
        }
    }
}

export default IcecreamCommand;