import { SegmenterContext } from "../contexts/SegmenterContext";
import React, { useContext, useEffect, useState } from "react";
import * as bunsetsu from "bunsetsu";
import Word, { WordIndex } from "./Word";
import { JMdictWord } from "@scriptin/jmdict-simplified-types";
import { RuntimeMessage, RuntimeEvent, LookupWordsMessage } from "../../common/events";
import { toHiragana } from "../../common/lang";
import { ChromeExtensionContext, ExtensionContext } from "../contexts/ExtensionContext";
import { sendMessage } from "../util/browser-runtime";
import { DBStatusResult } from "../../database/dbstatus";

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

async function lookupWords(words: bunsetsu.Word[], context: ExtensionContext): Promise<WordDetails[]> {
    const data: LookupWordsMessage = {
        words: words.map(word => {
            return {
                surfaceForm: word.surfaceForm,
                baseForm: word.baseForm ?? "",
                katakana: word.reading ?? "",
                hiragana: toHiragana(word.reading),
            };
        })
    };
    const message: RuntimeMessage = { event: RuntimeEvent.LookupWords, data: data };
    const entries = await sendMessage(message, context);
    return words.map((word, index) => {
        return {
            word,
            entry: entries[index]
        }
    });
}

type WordDetails = {
    word: bunsetsu.Word;
    entry?: JMdictWord;
}

export interface SubtitleProps {
    dbStatus: DBStatusResult;
    cue: TextTrackCue;
    fontSize: number;
}

function Subtitle({ cue, fontSize }: SubtitleProps) {
    const segmenterContext = useContext(SegmenterContext);
    const extensionContext = useContext(ChromeExtensionContext);
    const [dbStatus, setDBStatus] = useState<DBStatusResult | null>(null);
    const [selectedWord, setSelectedWord] = useState<WordIndex | null>(null);
    const lines = parseCue(cue, segmenterContext.segmenter);
    const [lineDetails, setLineDetails] = useState<WordDetails[][]>([]);

    useEffect(() => {
        (async () => {
            const results = lines.map(line => lookupWords(line, extensionContext));
            const lineEntries = await Promise.all(results);
            setLineDetails(lineEntries);
        })();
    }, []);

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
                lineDetails.map((line: WordDetails[], lineIndex: number) => {
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