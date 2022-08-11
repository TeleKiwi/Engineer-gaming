import { AttachmentBuilder, CommandInteraction, Message } from "discord.js";
import GameCommand from "../classes/gameCommand";
import { Lang } from "../lang/lang";
import { Minesweeper } from "../utils/minesweeper";
import Canvas from "canvas";
import fs from "fs";

interface ImagesInterface {
    [key: string]: Canvas.Image;
}

interface GamesInterface {
    [key: string]: any
}

let TileBonuses: GamesInterface = {
    "0": 0,
    "1": 0.01,
    "2": 0.03,
    "3": 0.04,
    "4": 0.10,
    "5": 0.15,
    "6": 0.20,
    "7": 0.35,
    "8": 0.50
}

// every time i delete ye it comes back

let games: GamesInterface = {};
let images: ImagesInterface = {};
let Scale = 2.0;
let Utils: any = undefined;

function RenderSweeper(MS: Minesweeper, xray?: boolean) {
    let canv = Canvas.createCanvas(images["window.png"].width,images["window.png"].height);
    let ctx = canv.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    let ox = 3;
    let oy = 22;
    ctx.drawImage(images["window.png"],0,0);

    for (let y = 0; y < MS.height; y++) {
        ctx.fillText((y+10).toString(36).toUpperCase(),(6*Scale)+ox,oy+((y+1.5)*16*Scale),16*Scale);
    }

    for (let y = 0; y < MS.height; y++) {
        for (let x = 0; x < MS.width; x++) {
            let element = MS.getTile(x,y);
            let tile = "";

            if (xray) {
                if (element.covered && element.flag) {
                    tile = element.isMine ? "correct.png" : "flag.png";
                } else {
                    tile = element.isMine ? (element.covered ? "mine.png" : "minered.png") : `${element.number}.png`;
                }
            } else {
                if (element.covered) {
                    tile = element.flag ? "flag.png" : "covered.png"
                } else if (element.isMine) {
                    tile = "minered.png";
                } else {
                    tile = `${element.number}.png`;
                }
            }

            ctx.drawImage(images[tile],((x+1)*16*Scale)+ox,((y+1)*16*Scale)+oy,Scale*16,Scale*16);
        }
    }

    return canv;
}

async function MSGameEvent(message: Message, language: Lang, key: string) {
    if (!games[message.author.id]) return;
    if (message.channelId != games[message.author.id][2]) return;

    if (message.content.length <= 3) {
        let flag = message.content.startsWith(">");
        let x = parseInt(message.content.charAt(0 + (+flag as number)))-1;
        let y = ["A","B","C","D","E","F","G","H","I"].indexOf(message.content.charAt(1 + (+flag as number)).toUpperCase());

        if (!isNaN(x) && (y != -1 && y < 9)) {
            message.delete().catch(() => {});
            let MS = games[message.author.id][0];

            flag ? MS.flag(x,y) : MS.uncover(x,y);

            if (MS.gameover && (MS.flags <= MS.mines)) {
                let Money = 0;
                let TileBonus = -1;

                for (let y = 0; y < MS.height; y++) {
                    for (let x = 0; x < MS.width; x++) {
                        let element = MS.getTile(x,y);
                        if (element.flag && element.isMine) Money += 100;
                        if (!element.isMine && !element.covered) TileBonus = Math.max(element.number,TileBonus);
                    }
                }

                Money = Money + (Money * TileBonuses[TileBonus.toString()] as number);
                Utils.currency.transfer(Utils.currency.engineerId,message.author.id,Money);
                let embed = Utils.embedGen.Normal(language.get("minesweeperTitle"),language.get("minesweeperEnd",Utils.currency.formatMoney(Money)));
                let attach = new AttachmentBuilder(RenderSweeper(MS, true).toBuffer("image/png"), { "name": "minesweeper.png" });
                embed.setImage("attachment://minesweeper.png");
                await games[message.author.id][1].edit({ embeds: [embed], files: [attach] });
                return "delete";
            }

            let embed = Utils.embedGen.Normal(language.get("minesweeperTitle"),`:triangular_flag_on_post: ${MS.flags}/${MS.mines}`);
            let attach = new AttachmentBuilder(RenderSweeper(MS).toBuffer("image/png"), { "name": "minesweeper.png" });
            embed.setImage("attachment://minesweeper.png");
            await games[message.author.id][1].edit({ embeds: [embed], files: [attach] });
            return true;
        }
    }
}

// --------------------------------------------------------------------- \\

class MinesweeperCommand extends GameCommand {
    name: string = "minesweeper";
    aliases: string[] = ["ms"];
    description: string = "Play minesweeper on discord!";

    init() {
        Utils = this.utils;
        Utils.Log(`[>] Loaded \"${this.name}\" command.`);

        fs.readdir("assets/minesweeper", function (err, files) {
            if (err) return Utils.Log(`Unable to scan directory: ${err}`);

            files.forEach(function (file) {
                fs.readFile(`assets/minesweeper/${file}`, function(err, data) {
                    if (err) throw err;
                    let img = new Canvas.Image;
                    img.src = data;
                    images[file] = img;
                    Utils.Log(`"minesweeper": Loaded image "assets/minesweeper/${file}"`);
                });
            });
        });
    }

    // --------------------------------------------------------------------- \\
    
    async run(message: Message, language: Lang) {
        if (!message.deletable) {
            await message.channel.send(language.get("deletePerms"));
            return false;
        } else if (games[message.author.id]) {
            await message.channel.send(language.get("alreadyGame"));
            return false;
        }
        
        let MS = new Minesweeper(9,9);

        for (let index = 0; index < 10; index++) {
            let x = Utils.RNG.Int(0,MS.width-1);
            let y = Utils.RNG.Int(0,MS.height-1);

            if ((x != 0 && y != 0) && !MS.placeMine(x,y)) {
                index--;
            }
        }

        MS.uncover(0,0);

        let embed = Utils.embedGen.Normal(language.get("minesweeperTitle"),`${language.get("minesweeperStart")}\n:triangular_flag_on_post: 0/${MS.mines}`);
        let attach = new AttachmentBuilder(RenderSweeper(MS).toBuffer("image/png"), { "name": "minesweeper.png" });
        embed.setImage("attachment://minesweeper.png");
        let msg = await message.channel.send({ embeds: [embed], files: [attach] });
        games[message.author.id] = [MS,msg,message.channelId,this.deleteMessageEvent];
        this.newMessageEvent(1000 * 60 * 2.25,() => games[message.author.id] = undefined, MSGameEvent);
    }

    // --------------------------------------------------------------------- \\

    async runSlash(interaction: CommandInteraction, language: Lang) {
        if (!interaction.isRepliable()) return;
        interaction.reply(language.get("useLegacy",`${this.prefix}${this.name}`));
    }
}

export default MinesweeperCommand;