import { CommandInteraction, Message, MessageType, SlashCommandBuilder, Utils } from "discord.js";
import { Command } from "../classes/command";
import { Lang } from "../lang/lang";

function ask(q: string, user: string, lang: Lang, Utils: any) {
    let question = q;

    if (question == "" || question == " ") {return lang.get("askEmptyQuestion",user)};

    while (/\?$|\!$|\.$/g.test(question)) {question = question.substring(0,question.length-1)};
    while (question.charAt(0) == " ") {question = question.replace(/^ /,"")};
    
    if (question.toLowerCase().endsWith("should i kill myself")) {
        return lang.get("dontKYS",user);
    }

    if (question.toLowerCase().endsWith("i teleported bread")) {
        return lang.get("teleportBread");
    }

    if (Math.floor(Math.random()*2) == 0) {
        return lang.get("askYes")[Math.floor(Math.random()*lang.get("askYes").length)];
    } else {
        return lang.get("askNo")[Math.floor(Math.random()*lang.get("askNo").length)];
    }
}

class AskCommand extends Command {
    name: string = "ask";
    aliases: string[] = [];
    description: string = "Ask me somenthing.";

    // --------------------------------------------------------------------- \\
    
    async run(message: Message, language: Lang) {
        let Utils = this.utils;

        message.channel.send(ask(this.getArgs(message.content).join(" "), message.author.username, language, Utils));
    }

    // --------------------------------------------------------------------- \\

    getSlash(): any {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description).addStringOption(option => option.setName("question").setDescription("Your question.").setRequired(true));
    }

    async runSlash(interaction: CommandInteraction, language: Lang) {
        if (!interaction.isRepliable()) return;
        let Utils = this.utils;
        let Question = interaction.options.get("question")?.value as string;

        interaction.reply(ask(Question, interaction.user.username, language, Utils));
    }

    async messageEvent(message: Message<boolean>, language: Lang): Promise<any> {
        if (((!message.content.includes("@here") || !message.content.includes("@everyone")) || message.type == MessageType.Reply) && (message.mentions.has(this.client.user?.id as string))) {
            if (message.content.endsWith("?")) { 
                message.channel.send(ask(message.content.split("<@!943698437281562665>").join(""),message.author.username,language,Utils));
                return;
            }
        }
    }
}

export default AskCommand;