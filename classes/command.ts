import { Client, Message, SlashCommandBuilder, ButtonInteraction, CommandInteraction } from "discord.js";
import { UtilsInterface } from "../utils/utils";
import { Lang } from "../lang/lang";

export class Command {
    type: string = "normal";

    name: string = "";
    description: string = "No description found.";
    arguments: string = "";
    aliases: string[] = [];
    permissions: any[] = [];
    credits: any[] = ["hd28br"]; // The people that made the command

    client: Client;
    utils: UtilsInterface;
    prefix: string = "";
    commands: any;
    constructor(client : Client, Utils : UtilsInterface, prefix: string, Command: any) {
        this.client = client;
        this.utils = Utils;
        this.prefix = prefix;
        this.commands = Command;
    }

    getArgs(content: string) {
        let Split = content.split(/ |\\n/g);
        Split.shift();
        return Split;
    }

    async run(message: Message, language: Lang): Promise<any> {
        await message.channel.send("I've come to make an announcement: Shadow the Hedgehog's a bitch-ass motherfucker. He pissed on my fucking wife. That's right. He took his hedgehog fuckin' quilly dick out and he pissed on my FUCKING wife, and he said his dick was THIS BIG, and I said that's disgusting. So I'm making a callout post on my Twitter.com. Shadow the Hedgehog, you got a small dick. It's the size of this walnut except WAY smaller. And guess what? Here's what my dong looks like. That's right, baby. Tall points, no quills, no pillows, look at that, it looks like two balls and a bong. He fucked my wife, so guess what, I'm gonna fuck the earth. That's right, this is what you get! My SUPER LASER PISS! Except I'm not gonna piss on the earth. I'm gonna go higher. I'm pissing on the MOOOON! How do you like that, OBAMA? I PISSED ON THE MOON, YOU IDIOT! You have twenty-three hours before the piss DROPLETS hit the fucking earth, now get out of my fucking sight before I piss on you too!");
    }

    async runSlash(interaction: CommandInteraction, language: Lang): Promise<any> {
        if (!interaction.isRepliable()) return;

        await interaction.reply("I've come to make an announcement: Shadow the Hedgehog's a bitch-ass motherfucker. He pissed on my fucking wife. That's right. He took his hedgehog fuckin' quilly dick out and he pissed on my FUCKING wife, and he said his dick was THIS BIG, and I said that's disgusting. So I'm making a callout post on my Twitter.com. Shadow the Hedgehog, you got a small dick. It's the size of this walnut except WAY smaller. And guess what? Here's what my dong looks like. That's right, baby. Tall points, no quills, no pillows, look at that, it looks like two balls and a bong. He fucked my wife, so guess what, I'm gonna fuck the earth. That's right, this is what you get! My SUPER LASER PISS! Except I'm not gonna piss on the earth. I'm gonna go higher. I'm pissing on the MOOOON! How do you like that, OBAMA? I PISSED ON THE MOON, YOU IDIOT! You have twenty-three hours before the piss DROPLETS hit the fucking earth, now get out of my fucking sight before I piss on you too!");
    }

    init() {
        this.utils.Log(`[>] Loaded \"${this.name}\" command.`);
    }

    async button(interaction: ButtonInteraction, language: Lang) {
        /* */
    }

    getSlash() {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description);
    }

    async messageEvent(message: Message, language: Lang): Promise<any> {
        ////////////////////////////////////////////////////////////
    }

    shutdownState() {
        return true;
    }
}