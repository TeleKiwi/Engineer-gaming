import { randomInt } from "crypto";

export class RNG {
    Random(): number {
        return randomInt(0,2**47) / (2**47);
    }

    /**
     * Get a random integer between **min** and **max** (Inclusive)
     * @param {Number} min
     * @param {Number} max 
     * @returns Integer
     */
    Int(max: number, min: number) {
        return Math.floor((this.Random()) * (max - min + 1) + min);
    }

    /**
     * Get a random element of array
     * @param {Array} arr
     * @returns any
     */
     Array(arr: any[]) {
        if (!Array.isArray(arr)) throw TypeError("arr is not an array");
        return arr[this.Int(0,arr.length-1)];
    }

    Chance(chance: number) {
        return this.Random() <= chance;
    }
}