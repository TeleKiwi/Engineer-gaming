import { appendFileSync } from "fs";

export function Log(s: string, color?: Number[]) {
    if (color != undefined) {
        console.log(`\x1b[38;2;${color[0]};${color[1]};${color[2]}m[${(new Date()).toLocaleDateString()} ${(new Date()).toLocaleTimeString()}] ${s}\x1b[0m`);
    } else {
        console.log(`[${(new Date()).toLocaleDateString()} ${(new Date()).toLocaleTimeString()}] ${s}`);
    }

    appendFileSync("./botLog.log",`[${(new Date()).toLocaleDateString()} ${(new Date()).toLocaleTimeString()}] ${s}\n`);
}