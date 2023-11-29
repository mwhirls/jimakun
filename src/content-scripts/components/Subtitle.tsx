import { IpadicFeatures, Tokenizer } from "kuromoji";
import Token from "./Token";

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
            return tokens.map((token, index) => <Token key={index} token={token}></Token>);
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
        <div style={style} className="block relative -left-1/2 font-bold drop-shadow-[0_0_7px_#000000]">
            {lines}
        </div>
    )
}
export default Subtitle;