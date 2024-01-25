import Token, { TokenProps } from "./Token";
import React, { useContext } from 'react';
import * as bunsetsu from "bunsetsu";
import * as Diff from "diff";
import './Word.css'
import Card from "./lookup/Card";
import { toHiragana } from "../../common/lang";
import { JMdictWord } from "@scriptin/jmdict-simplified-types";

function toTokens(word: bunsetsu.Word): TokenProps[] {
    const wordSurfaceForm = word.surfaceForm;
    if (!wordSurfaceForm.length) {
        return [];
    }
    const katakana = word.reading; // kuromoji gives us readings in katakana
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
    entry?: JMdictWord;
    index: WordIndex;
    selected: boolean;
    onWordClicked: (index: WordIndex) => void;
    onDeselected: () => void;
}

function Word({ word, entry, index, selected, onWordClicked, onDeselected }: WordProps) {
    const tokensProps = toTokens(word);
    const disabled = !entry;
    const hover = disabled ? "hover:text-slate-200" : "hover:text-red-500";
    const color = selected ? "text-red-500" : `text-white ${hover}`;

    return (
        <span className="relative inline-block">
            <button className={`${color} subtitle-word disabled:cursor-not-allowed`} onClick={() => onWordClicked(index)} disabled={disabled}>
                {
                    tokensProps.map((props, index) => {
                        return (
                            <Token key={index} {...props} />
                        );
                    })
                }
            </button>
            {
                selected && entry &&
                <div className='absolute left-0 bottom-full w-max'>
                    <Card word={word} entry={entry} onCardClosed={() => onDeselected()}></Card>
                </div>
            }
        </span>
    );
}
export default Word;