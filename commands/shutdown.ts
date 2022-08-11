import { CommandInteraction, Message } from "discord.js";
import { Command } from "../classes/command";
import { Lang } from "../lang/lang";

class ShutdownCommand extends Command {
    name: string = "shutdown";
    permissions: any[] = ["BOT_OWNER"];
    description: string = "Shutdown the bot (Owner only)";

    async run(message: Message, language: Lang) {
        let Utils = this.utils;

        message.channel.send({ embeds: [Utils.embedGen.Normal(language.get("shutDownTitle"),language.get("shutDownDesc"))] }).then(() => {
            Utils.currency.save();
            this.client.destroy();
            process.exit(0);
        });
    }

    async runSlash(interaction: CommandInteraction, language: Lang) {
        if (!interaction.isRepliable()) return;
        let Utils = this.utils;

        interaction.reply({ embeds: [Utils.embedGen.Normal(language.get("shutDownTitle"),language.get("shutDownDesc"))] }).then(() => {
            Utils.currency.save();
            this.client.destroy();
            process.exit(0);
        });
    }
}

export default ShutdownCommand;