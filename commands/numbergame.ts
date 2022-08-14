import { CommandInteraction, Message } from "discord.js";
import GameCommand from "../classes/gameCommand";
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

interface GamesInterface { // Fun fact: never try to make jokes past 9 PM
    [key: string]: any
}

let games: GamesInterface = {};

class NumbergameCommand extends GameCommand {
    name: string = "numbergame";
    aliases: string[] = ["nb"];
    description: string = "Try to guess the number and win <:money:995821789466865764>.";

    // --------------------------------------------------------------------- \\
    
    async run(message: Message, language: Lang) {
        if (this.gShutdown) return;
        
        if (!message.deletable) {
            await message.channel.send(language.get("deletePerms"));
            return false;
        } else if (games[message.author.id]) {
            await message.channel.send(language.get("alreadyGame"));
            return false;
        }

        let Utils = this.utils;
        
        let Max: any = Utils.RNG.Int(100,200);
        let Min: any = 0;
        let Number: any = Utils.RNG.Int(1,Max-1);
        Utils.Log(Number);

        games[message.author.id] = [Number,Max,Min,0];

        await message.channel.send(language.get("numberGameStart"));
        let pastMessage = await message.channel.send(language.get("numberGameNum",[0,Max]));
        Max = undefined;
        Min = undefined;
        Number = undefined;

        // This code sucks
        this.newMessageEvent(message.author.id,75000,(reason: string, key: string) => {
            games[message.author.id] = undefined;
        },(otherMessage: Message, lang: Lang, key: string) => {
            if (otherMessage.channelId != message.channel.id) return false;
            if (otherMessage.author.id != message.author.id) return false;
            
            if (isNumeric(otherMessage.content)) {
                let num = parseInt(otherMessage.content);
                let game = games[message.author.id];

                if (num > game[2] && num < game[1]) {
                    if (num == game[0]) {
                        message.reply(language.get("numberGameWin",Utils.currency.formatMoney(Math.floor(1000 / (2 ** game[3])))));
                        Utils.currency.transfer(Utils.currency.engineerId,message.author.id,Math.floor(1000 / (2 ** game[3])));
                        return "delete";
                    }
                    
                    if (num > game[0]) {
                        otherMessage.delete().catch(() => {});
                        game[1] = num;
                    }
                    if (num < game[0]) {
                        otherMessage.delete().catch(() => {});
                        game[2] = num;
                    }

                    if (Math.floor(1000 / (2 ** game[3]+1)) == 0) {
                        pastMessage.edit(language.get("numberGameLose"));
                    } else {
                        let Extra = "\n";
    
                        if (Math.floor(1000 / (2 ** game[3])) == 1) {
                            if (game[0] % 2 != 0) {
                                Extra += ":warning: " + language.get("numberGameEven");
                            } else {
                                Extra += ":warning: " + language.get("numberGameOdd");
                            }
                        }

                        pastMessage.edit(language.get("numberGameNum",[game[2],game[1]]) + Extra);
                    }

                    game[3]++; // Tries number
                    games[message.author.id] = game;
                    return true;
                } else {
                    return false;
                }
            }
        });
    }

    // --------------------------------------------------------------------- \\

    async runSlash(interaction: CommandInteraction, language: Lang) {
        if (!interaction.isRepliable()) return;
        interaction.reply(language.get("useLegacy",`${this.prefix}${this.name}`));
    }
}

export default NumbergameCommand;