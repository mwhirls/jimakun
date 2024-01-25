import React from "react";
import * as bunsetsu from "bunsetsu";
import Word, { WordIndex } from "./Word";
import { JMdictWord } from "@scriptin/jmdict-simplified-types";

export type WordDetails = {
    word: bunsetsu.Word;
    entry?: JMdictWord;
}

export type Line = WordDetails[];

export interface SubtitleProps {
    lines: Line[];
    selectedWord: WordIndex | null;
    setSelectedWord: (index: WordIndex | null) => void;
    fontSize: number;
}

function Subtitle({ lines, selectedWord, setSelectedWord, fontSize }: SubtitleProps) {
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
                lines.map((line: Line, lineIndex: number) => {
                    return (
                        <div key={lineIndex} className="block text-start m-0">
                            {
                                line.map((word: WordDetails, wordIndex: number) => {
                                    const index = { line: lineIndex, word: wordIndex };
                                    const selected = index.line === selectedWord?.line && index.word === selectedWord?.word;
                                    return <Word key={wordIndex} word={word.word} entry={word.entry} index={index} selected={selected} onWordClicked={onWordClicked} onDeselected={onWordDeselected}></Word>
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