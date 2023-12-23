import Token, { TokenProps } from "./Token";
import React, { MouseEventHandler, useState } from 'react';
import * as bunsetsu from "bunsetsu";
import * as Diff from "diff";
import './Word.css'

function toHiragana(text: string | undefined): string {
    if (!text) {
        return "";
    }
    const result = [];
    for (let i = 0; i < text.length; i++) {
        const code = text.codePointAt(i);
        if (code && code >= 0x30A1 && code <= 0x30F6) { // katakana 
            result.push(String.fromCodePoint(code - 0x60));
        } else if (code && code >= 0x3041 && code <= 0x3096) { // hiragana
            result.push(text.charAt(i));
        }
    }
    return result.join('');
}

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

interface WordProps {
    word: bunsetsu.Word;
    onWordClicked: (word: bunsetsu.Word, element: HTMLElement) => void;
}

function Word({ word, onWordClicked }: WordProps) {
    const tokensProps = toTokens(word);

    const onClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const element = e.target as HTMLElement;
        onWordClicked(word, element);
    }

    return (
        <span className="hover:text-red-500 subtitle-word" onClick={onClick}>
            {tokensProps.map((props, index) => {
                return (
                    <Token key={index} {...props} />
                );
            })}
        </span>
    );
}
export default Word;