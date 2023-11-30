import { IpadicFeatures, Tokenizer } from "kuromoji";
import Word from "./Word";
import { TokenizerContext } from "../contexts/TokenizerContext";
import { useContext } from "react";

function extractCueText(cue: TextTrackCue) {
    let cueText = (cue as any).text; // cue.text is not documented
    const tagsRegex = '(<([^>]+>)|&lrm;|&rlm;)';
    const regex = new RegExp(tagsRegex, 'ig');
    const match = regex.exec(cueText);
    return match ? cueText.replace(regex, '') : cueText;
}

function handleConjugatedVerb(tokens: IpadicFeatures[], start: number) {
    const word: IpadicFeatures[] = [tokens[start]];
    let index = start + 1;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.pos_detail_1 === '非自立' ||
            token.pos === "助詞" && token.pos_detail_1 === '接続助詞' ||
            token.pos === '助動詞') {
            index++;
            word.push(token);
        } else {
            break;
        }
    }
    return word;
}

function handleVerb(tokens: IpadicFeatures[], index: number): IpadicFeatures[] {
    const token = tokens[index];
    if (token.conjugated_form === "連用形" ||
        token.conjugated_form === '連用タ接続') {
        return handleConjugatedVerb(tokens, index);
    }
    return [token];
}

function handleWord(tokens: IpadicFeatures[], index: number): IpadicFeatures[] {
    const token = tokens[index];
    if (token.pos === '動詞') {
        return handleVerb(tokens, index);
    } else {
        return [token];
    }
}

function toWords(tokens: IpadicFeatures[]): IpadicFeatures[][] {
    const result = [];
    let index = 0;
    while (index < tokens.length) {
        const word = handleWord(tokens, index);
        index += word.length;
        result.push(word);
    }
    return result;
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
            const words = toWords(tokens);
            return words.map((tokens, index) => <Word key={index} tokens={tokens}></Word>);
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
        <div style={style} className="block relative -left-1/2 font-bold drop-shadow-[0_0_7px_#000000] pointer-events-auto select-text">
            {lineElems}
        </div>
    )
}
export default Subtitle;