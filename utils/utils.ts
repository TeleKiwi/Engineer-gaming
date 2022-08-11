// Utils mega collections

import { Log } from "./log";
import { RNG } from "./RNG";
import { EG, EGInterface } from "./embedGen";
import { Currency } from "./currency";

interface UtilsInterface {
    Log: any;
    RNG: RNG;
    embedGen: EGInterface;
    currency: Currency;
}

const Utils: UtilsInterface = {
    Log: Log,
    RNG: new RNG(),
    embedGen: EG,
    currency: new Currency("./data/money.json")
}

export {Utils, UtilsInterface};