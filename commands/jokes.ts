import { CommandInteraction, Message } from "discord.js";
import { Command } from "../classes/command";
import { Lang } from "../lang/lang";
import { readFileSync } from "fs";

const jokesArray = readFileSync("./assets/jokes.txt").toString().split("\n");

class JokeCommand extends Command {
    name: string = "jokes";
    aliases: string[] = ["joke"];
    description: string = "Get a random joke. \"Thats a joke lads\"";

    // --------------------------------------------------------------------- \\

    async run(message: Message, language: Lang) {
        let Utils = this.utils;

        let t = Utils.RNG.Int(0,jokesArray.length-1);
        await message.channel.send(`${jokesArray[t].replace(/\\n/gm,"\n")}\n_Joke number: ${t+1}_`);
    }
    
    // --------------------------------------------------------------------- \\

    async runSlash(interaction: CommandInteraction, language: Lang) {
        if (!interaction.isRepliable()) return;
        let Utils = this.utils;

        let t = Utils.RNG.Int(0,jokesArray.length-1);
        await interaction.reply(`${jokesArray[t].replace(/\\n/gm,"\n")}\n_Joke number: ${t+1}_`);
    }
}

export default JokeCommand;