import React from "react";
import * as bunsetsu from "bunsetsu";
import Word, { WordIndex } from "./Word";
import { JMdictWord } from "@scriptin/jmdict-simplified-types";
import { Blocked, Busy, ErrorOccurred, Status, VersionChanged } from "../../database/dbstatus";
import DatabaseBlocked from "../../common/components/DatabaseBlocked";
import DatabaseBusy from "../../common/components/DatabaseBusy";
import DatabaseError from "../../common/components/DatabaseError";
import Spinner from "../../common/components/Spinner";

export type WordDetails = {
    word: bunsetsu.Word;
    entry?: JMdictWord;
}

export type Line = WordDetails[];

export interface SubtitleLoadingProps {
    cueText: string;
    dbStatus: Blocked | Busy | ErrorOccurred | VersionChanged;
    fontSize: number;
}

export function SubtitleLoading({ cueText, dbStatus, fontSize }: SubtitleLoadingProps) {
    const content = () => {
        switch (dbStatus.type) {
            case Status.Blocked:
                return <DatabaseBlocked></DatabaseBlocked>
            case Status.Busy:
                return <DatabaseBusy dbStatus={dbStatus}></DatabaseBusy>
            case Status.ErrorOccurred:
                return <DatabaseError></DatabaseError>
        }
    }

    const style = {
        fontSize: `${fontSize}px`,
    };

    return (
        <div style={style} className="group block relative -left-1/2 rounded-lg pointer-events-auto hover:bg-opacity-25 hover:bg-white">
            <span className="inline-block font-bold drop-shadow-[0_0_7px_#000000] select-text">{cueText}</span>
            <span className="inline-block w-12 align-middle ml-4 relative">
                <Spinner thickness={2}></Spinner>
                <div className='absolute left-0 bottom-full w-max bg-white rounded-lg p-2 hidden group-hover:block'>
                    {content()}
                </div>
            </span>
        </div>
    )
}

export interface SubtitleProps {
    lines: Line[];
    selectedWord: WordIndex | null;
    setSelectedWord: (index: WordIndex | null) => void;
    fontSize: number;
}

function Subtitle({ lines, selectedWord, setSelectedWord, fontSize }: SubtitleProps) {
    const onWordClicked = (index: WordIndex) => {
        if (selectedWord && index.equals(selectedWord)) {
            setSelectedWord(null);
        } else {
            setSelectedWord(index);
        }
    };
    const onWordDeselected = () => setSelectedWord(null);

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
                                    const index = new WordIndex(lineIndex, wordIndex);
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