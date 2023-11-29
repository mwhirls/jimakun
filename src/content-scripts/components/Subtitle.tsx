import { IpadicFeatures, Tokenizer } from "kuromoji";
import Token from "./Token";
import { TokenizerContext } from "../contexts/TokenizerContext";
import { useContext } from "react";

function extractCueText(cue: TextTrackCue) {
    let cueText = (cue as any).text; // cue.text is not documented
    const tagsRegex = '(<([^>]+>)|&lrm;|&rlm;)';
    const regex = new RegExp(tagsRegex, 'ig');
    const match = regex.exec(cueText);
    return match ? cueText.replace(regex, '') : cueText;
}

interface SubtitleProps {
    cue: TextTrackCue,
    fontSize: number,
}

// font-family: 'Netflix Sans', 'Helvetica Nueue', 'Helvetica', 'Arial', sans-serif;
function Subtitle({ cue, fontSize }: SubtitleProps) {
    const tokenizerContext = useContext(TokenizerContext);
    let text = extractCueText(cue);
    const lines = text.split('\n');
    const lineElems = lines.map((line: string, index: number) => {
        const parseTokens = (text: string) => {
            const tokenizer = tokenizerContext.tokenizer
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
            {lineElems}
        </div>
    )
}
export default Subtitle;