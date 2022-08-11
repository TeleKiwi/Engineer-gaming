import { EmbedBuilder } from "discord.js";

interface EGInterface {
    [key: string]: any
}

let EG: EGInterface = {};

EG.Normal = (title: string, desc?: string): EmbedBuilder => {
    const embed = new EmbedBuilder().setTitle(title);
    embed.setColor("#2f3136");
    embed.setDescription(desc == undefined ? " " : desc);
    embed.setTimestamp();

    return embed;
}

EG.Error = (desc: string): EmbedBuilder => {
    const embed = new EmbedBuilder().setTitle("**:x: Error**");
    embed.setColor("#f04747");
    embed.setDescription(desc);
    embed.setTimestamp();

    return embed;
}

export { EG, EGInterface };