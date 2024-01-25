import { SegmenterContext } from "../contexts/SegmenterContext";
import React, { useContext, useState } from "react";
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

function Subtitle({ cue, fontSize }: SubtitleProps) {
    const context = useContext(SegmenterContext);
    const [selectedWord, setSelectedWord] = useState<WordIndex | null>(null);
    const lines = parseCue(cue, context.segmenter);

    const onWordClicked = (index: WordIndex) => {
        setSelectedWord(index);
    };
    const onWordDeselected = () => {
        setSelectedWord(null);
    }

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
                                    const selected = index.line === selectedWord?.line && index.word === selectedWord?.word;
                                    return <Word key={wordIndex} word={word} index={index} selected={selected} onWordClicked={onWordClicked} onDeselected={onWordDeselected}></Word>
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