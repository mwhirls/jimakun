import Token, { TokenProps } from "./Token";
import React from 'react';
import * as bunsetsu from "bunsetsu";
import * as Diff from "diff";
import './Word.css'
import Card from "./lookup/Card";
import { toHiragana } from "../../common/lang";

function toTokens(word: bunsetsu.Word): TokenProps[] {
    const wordSurfaceForm = word.surfaceForm();
    if (!wordSurfaceForm.length) {
        return [];
    }
    const katakana = word.reading(); // kuromoji gives us readings in katakana
    const hiragana = toHiragana(katakana);
    const tokens: TokenProps[] = [];
    const diff = Diff.diffChars(wordSurfaceForm, hiragana);
    for (let i = 0; i < diff.length; i++) {
        const part = diff[i];
        if (part.removed) {
            const j = i + 1;
            const next = diff[j];
            if (next?.added) {
                const surfaceForm = part.value;
                const furigana = next.value;
                const props = { surfaceForm, furigana };
                tokens.push(props);
                i = j;
            } else {
                const props = { surfaceForm: part.value, furigana: undefined };
                tokens.push(props);
            }
        } else {
            const props = { surfaceForm: part.value, furigana: undefined };
            tokens.push(props);
        }
    }
    return tokens;
}

export interface WordIndex {
    line: number;
    word: number;
}

export interface WordProps {
    word: bunsetsu.Word;
    index: WordIndex;
    active: boolean;
    onWordClicked: (index: WordIndex) => void;
}

function Word({ word, index, active, onWordClicked }: WordProps) {
    const tokensProps = toTokens(word);

    const lookupCard = (() => {
        if (!active) {
            return <></>;
        }
        return (
            <div className='absolute left-0 bottom-full w-max'>
                <Card word={word}></Card>
            </div>
        )
    })();

    return (
        <span className="hover:text-red-500 relative subtitle-word" onClick={() => onWordClicked(index)}>
            {tokensProps.map((props, index) => {
                return (
                    <Token key={index} {...props} />
                );
            })}
            {lookupCard}
        </span>
    );
}
export default Word;