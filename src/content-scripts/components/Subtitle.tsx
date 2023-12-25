import { SegmenterContext } from "../contexts/SegmenterContext";
import React, { useContext, useRef, useState } from "react";
import * as bunsetsu from "bunsetsu";
import Word, { WordIndex } from "./Word";

function extractCueText(cue: TextTrackCue): string {
    const cueText = (cue as any).text; // cue.text is not documented
    const tagsRegex = '(<([^>]+>)|&lrm;|&rlm;)';
    const regex = new RegExp(tagsRegex, 'ig');
    const match = regex.exec(cueText);
    return match ? cueText.replace(regex, '') : cueText;
}

function parseCue(cue: TextTrackCue, segmenter: bunsetsu.Segmenter | null): bunsetsu.Word[][] {
    const text = extractCueText(cue);
    if (!segmenter) {
        return [];
    }
    const lines = text.split('\n');
    return lines.map((line: string) => segmenter.segmentAsWords(line));
}

interface SubtitleProps {
    cue: TextTrackCue,
    fontSize: number,
}

// font-family: 'Netflix Sans', 'Helvetica Nueue', 'Helvetica', 'Arial', sans-serif;
function Subtitle({ cue, fontSize }: SubtitleProps) {
    const context = useContext(SegmenterContext);
    const [lines, setLines] = useState<bunsetsu.Word[][]>(parseCue(cue, context.segmenter));
    const [activeWord, setActiveWord] = useState<WordIndex | null>(null);

    const onWordClicked = (index: WordIndex) => {
        setActiveWord(index);
    };

    const style = {
        fontSize: `${fontSize}px`,
    };

    return (
        <div style={style} className="block relative -left-1/2 font-bold drop-shadow-[0_0_7px_#000000] pointer-events-auto select-text">
            {
                lines.map((line: bunsetsu.Word[], lineIndex: number) => {
                    return (
                        <div key={lineIndex} className="block text-start m-0">
                            {
                                line.map((word: bunsetsu.Word, wordIndex: number) => {
                                    const index = { line: lineIndex, word: wordIndex };
                                    const active = index.line === activeWord?.line && index.word === activeWord?.word;
                                    return <Word key={wordIndex} word={word} index={index} active={active} onWordClicked={onWordClicked}></Word>
                                })
                            }
                        </div>
                    );
                })
            }
        </div>
    )
}
export default Subtitle;