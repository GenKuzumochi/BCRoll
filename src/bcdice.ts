import { Version } from 'bcdice';
import StaticLoader from 'bcdice/lib/loader/static_loader'
import Result from 'bcdice/lib/result';

const loader = new StaticLoader();

const list = [
    { regex: /cl/i, value: "CodeLayerd" },
    { regex: /dx/i, value: "DoubleCross" }
]

type BCDiceResult = {
    result: Result,
    system: string,
}

export function bcdice_roll(text: string, system?: string): BCDiceResult | null {
    if (system == null) {
        system = list.find(x => x.regex.test(text))?.value ?? "DiceBot"
    }
    const cls = loader.getGameSystemClass(system);

    const result = cls.eval(text);
    if(result == null) return null;
    return { result, system}
}

export const systems = loader.listAvailableGameSystems();