import { IpadicFeatures } from "kuromoji";
import './Token.css'

function toHiragana(text: string | undefined): string {
    if (!text) {
        return "";
    }
    const result = [];
    for (let i = 0; i < text.length; i++) {
        const code = text.codePointAt(i);
        if (code && code >= 0x30A1 && code <= 0x30F6) {
            result.push(String.fromCodePoint(code - 0x60));
        }
    }
    return result.join('');
}

function getReading(token: IpadicFeatures) {
    let furigana = toHiragana(token.reading); // kuromoji gives us readings in katakana
    if (furigana === token.surface_form || token.reading === token.surface_form) {
        return <></>;
    } else {
        return <><rp>(</rp><rt>{furigana}</rt><rp>)</rp></>
    }
};

interface TokenProps {
    token: IpadicFeatures,
}

function Token({ token }: TokenProps) {
    const reading = getReading(token);
    return (
        <span className="jimakun-subtitle-token">
            <ruby>
                {token.surface_form}<rp>(</rp><rt>{reading}</rt><rp>)</rp>
            </ruby>
        </span>);
}
export default Token;