import { Version } from 'bcdice';
import StaticLoader from 'bcdice/lib/loader/static_loader'
import Result from 'bcdice/lib/result';

const loader = new StaticLoader();

const list = [
    { regex: /cl/i, value: "CodeLayerd" },
    { regex: /^cc/i, value: "Cthulhu7th" },
    { regex: /^ccb<=/i, value: "Cthulhu" },
    { regex: /dx/i, value: "DoubleCross" },
    { regex: /gc/i, value: "GranCrest", replacer: (s:string)=>s.replace(/gc/,"d") + ">=?"}
]

type BCDiceResult = {
    result: Result,
    system: string,
}

export function bcdice_roll(text: string, system?: string): BCDiceResult | null {
    if (system == null) {
        const sys = list.find(x => x.regex.test(text))
        system = sys?.value ?? "DiceBot"
        text = sys?.replacer?.(text) ?? text
    }
    const cls = loader.getGameSystemClass(system);

    const result = cls.eval(text);
    if(result == null) return null;
    return { result, system}
}

export const systems = loader.listAvailableGameSystems();