import { Message, time } from "discord.js";
import { Command } from "./command";
import { Lang } from "../lang/lang";

interface EventsInterface {
    [key: string]: any
}

class GameCommand extends Command {
    type: string = "game";
    events: EventsInterface = {};
    keysList: string[] = [];

    async getRandomKey() {
        let key = "k";

        while (this.events[key]) {
            key += String.fromCharCode(await this.utils.RNG.Int(97, 112));
        }

        return key;
    }

    async newMessageEvent(timeout: number, deleteback: any, callback: any) {
        let key = await this.getRandomKey();

        this.utils.Log(`${this.name}: Key used ${key}`);
        
        let deleteTimeout = setTimeout(() => {
            deleteback("timeout",key);
            this.keysList.splice(this.keysList.indexOf(key), 1);
            this.events[key] = undefined;
        }, timeout);

        this.events[key] = [callback, deleteTimeout, deleteback, timeout];
        this.keysList.push(key);
    }

    deleteMessageEvent(key: string) {
        if (!this.keysList) return;
       if (this.keysList.indexOf(key) == -1) return;
        this.events[key][2]("delete", key);
        this.keysList.splice(this.keysList.indexOf(key), 1);
        this.events[key] = undefined;
    }
    
    async messageEvent(message: Message, language: Lang): Promise<any> {
        let deletes: any[] = [];
        this.keysList.forEach(async (element: string, index: number) => {
            let returned = await this.events[element][0](message, language, element);

            if (returned == true) {
                let event = this.events[element];
                clearTimeout(event[1]);

                this.events[element][1] = setTimeout(() => {
                    if (!event) return;
                    event[2]("timeout", element);
                    this.keysList.splice(this.keysList.indexOf(element), 1);
                    this.events[element] = undefined;
                    this.utils.Log(`\"${this.name}\": Deleted key \"${element}\", timeouted`);
                }, event[3]);
            } else if (returned == "delete") {
                deletes.push(element);
            }

            if (index == this.keysList.length-1) {
                deletes.forEach(element => {
                    this.utils.Log(`\"${this.name}\": Deleted key \"${element}\", returned delete`);
                    this.deleteMessageEvent(element);
                });
            }
        });
    }
}

export default GameCommand;