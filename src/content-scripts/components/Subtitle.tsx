import { SegmenterContext } from "../contexts/SegmenterContext";
import React, { useContext, useRef, useState } from "react";
import Word from "./Word";
import Card from "./card/Card";
import * as bunsetsu from "bunsetsu";

function extractCueText(cue: TextTrackCue) {
    const cueText = (cue as any).text; // cue.text is not documented
    const tagsRegex = '(<([^>]+>)|&lrm;|&rlm;)';
    const regex = new RegExp(tagsRegex, 'ig');
    const match = regex.exec(cueText);
    return match ? cueText.replace(regex, '') : cueText;
}

interface ActiveWord {
    word: bunsetsu.Word;
    offsetLeft: number;
    offsetTop: number;
}

interface SubtitleProps {
    cue: TextTrackCue,
    fontSize: number,
}

// font-family: 'Netflix Sans', 'Helvetica Nueue', 'Helvetica', 'Arial', sans-serif;
function Subtitle({ cue, fontSize }: SubtitleProps) {
    const context = useContext(SegmenterContext);
    const [activeWord, setActiveWord] = useState<ActiveWord | null>(null);
    const subtitleRef = useRef<HTMLDivElement>(null);

    const onWordClicked = (word: bunsetsu.Word, element: HTMLElement) => {
        if (!subtitleRef.current) {
            console.warn('failed to get subtitle position');
            return;
        }
        const offsetLeft = element.offsetLeft;
        const offsetTop = element.offsetTop;
        setActiveWord({ word, offsetLeft, offsetTop });
    };

    const text = extractCueText(cue);
    const lines = text.split('\n');
    const lineElems = lines.map((line: string, index: number) => {
        const parseTokens = (text: string) => {
            const segmenter = context.segmenter;
            if (!segmenter) {
                return text;
            }
            const words = segmenter.segmentAsWords(text);
            return words.map((word, index) => <Word key={index} word={word} onWordClicked={onWordClicked}></Word>);
        };
        const innerHTML = parseTokens(line);
        return (
            <div key={index} className="block text-start m-0">
                {innerHTML}
            </div>
        );

    });
    const vocabularyCard = (() => {
        if (!activeWord) {
            return <></>;
        }
        const cardStyle = {
            left: `${activeWord.offsetLeft}px`,
            bottom: `${activeWord.offsetTop}px`,
        }
        return (
            <div className='absolute' style={cardStyle}>
                <Card word={activeWord.word}></Card>
            </div>
        )
    })();

    const style = {
        fontSize: `${fontSize}px`,
    };

    return (
        <div ref={subtitleRef} style={style} className="block relative -left-1/2 font-bold drop-shadow-[0_0_7px_#000000] pointer-events-auto select-text">
            {vocabularyCard}
            {lineElems}
        </div>
    )
}
export default Subtitle;