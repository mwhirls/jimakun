import { IpadicFeatures } from "kuromoji";
import './Token.css'

function toHiragana(text: string | undefined) {
    if (!text) {
        return "";
    }
    let katakana = "";
    for (let ii = 0; ii < [...text].length; ii++) {
        const code = text.codePointAt(ii);
        if (!code) {
            continue;
        }
        if (code >= 0x30A1 && code <= 0x30F6) {
            const hiragana = String.fromCodePoint(code - 0x60);
            katakana = katakana.concat(hiragana);
        }
    }
    return katakana;
}

interface TokenProps {
    token: IpadicFeatures,
}

function Token({ token }: TokenProps) {
    let furigana = toHiragana(token.reading); // kuromoji gives us readings in katakana
    return (
        <span className="jimakun-subtitle-token pointer-events-auto select-text hover:text-red-500">
            <ruby>
                {token.surface_form}<rp>(</rp><rt>{furigana}</rt><rp>)</rp>
            </ruby>
        </span>);
}
export default Token;