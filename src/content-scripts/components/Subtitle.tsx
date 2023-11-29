import { IpadicFeatures, Tokenizer } from "kuromoji";

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

interface SubtitleProps {
    text: string,
    fontSize: number,
    tokenizer: Tokenizer<IpadicFeatures> | null,
}

// font-family: 'Netflix Sans', 'Helvetica Nueue', 'Helvetica', 'Arial', sans-serif;
function Subtitle({ text, fontSize, tokenizer }: SubtitleProps) {
    const linesText = text.split('\n');
    const lines = linesText.map((line, index) => {
        const parseTokens = (text: string) => {
            if (!tokenizer) {
                return text;
            }
            const tokens = tokenizer.tokenize(text);
            const tokenElems = tokens.map((token, index) => {
                let furigana = toHiragana(token.reading); // kuromoji gives us readings in katakana
                return (
                    <span key={index}>
                        <ruby>
                            {token.surface_form}<rp>(</rp><rt>{furigana}</rt><rp>)</rp>
                        </ruby>
                    </span>);
            });
            return tokenElems;
        };
        const innerHTML = parseTokens(line);
        return (
            <div key={index} className="block text-start m-0">
                {innerHTML}
            </div>
        );

    });
    const style = {
        fontSize: `${fontSize}px`,
    };

    return (
        <>
            <div style={style} className="block relative -left-1/2 font-bold drop-shadow-[0_0_7px_#000000]">
                {lines}
            </div>
        </>
    )
}
export default Subtitle;