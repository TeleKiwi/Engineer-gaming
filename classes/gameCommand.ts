import { Message, time } from "discord.js";
import { Command } from "./command";
import { Lang } from "../lang/lang";

interface EventsInterface {
    [key: string]: any
}

class GameCommand extends Command {
    type: string = "game";
    events: EventsInterface = {};
    gShutdown: any = false;

    eventExist(id: string) {
        return this.events[id] && this.events[id].timeout > (new Date().getTime());
    }

    async newMessageEvent(id: string, timeout: number, deleteback: any, callback: any) {
        if (this.eventExist(id)) return;

        this.events[id] = {
            timeoutDuration: timeout,
            timeout: (new Date().getTime()) + timeout,
            deleteback: deleteback,
            callback: callback
        };
    }

    deleteMessageEvent(id: string,reason: string) {
        if (!this.eventExist(id)) return;
        this.events[id].deleteback(reason);
        this.utils.Log(`${this.name} deleted ${id} with reason ${reason}`);
        delete this.events[id];
    }
    
    async messageEvent(message: Message, language: Lang): Promise<any> {
        if (this.eventExist(message.author.id)) {
            let event = this.events[message.author.id];
            let returned = event.callback(message, language);

            if (returned == true) {
                event.timeout = (new Date().getTime()) + event.timeoutDuration;
                this.events[message.author.id] = event;
            } else if (returned == "delete") {
                this.deleteMessageEvent(message.author.id,"return");
            }
        } else {
            this.deleteMessageEvent(message.author.id, "noexist");
        }
    }

    shutdownState(): boolean {
        this.gShutdown = true;
        return true;
    }
}

export default GameCommand;