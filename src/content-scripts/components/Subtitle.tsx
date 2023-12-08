import { SegmenterContext } from "../contexts/SegmenterContext";
import React, { useContext, useEffect } from "react";
import Word from "./Word";

function extractCueText(cue: TextTrackCue) {
    const cueText = (cue as any).text; // cue.text is not documented
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
    const context = useContext(SegmenterContext);
    const text = extractCueText(cue);
    const lines = text.split('\n');
    const lineElems = lines.map((line: string, index: number) => {
        const parseTokens = (text: string) => {
            const segmenter = context.segmenter;
            if (!segmenter) {
                return text;
            }
            const words = segmenter.segmentAsWords(text);
            return words.map((word, index) => <Word key={index} word={word}></Word>);
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