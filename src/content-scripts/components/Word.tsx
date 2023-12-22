import Token, { TokenProps } from "./Token";
import React from 'react';
import * as bunsetsu from "bunsetsu";
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

// http://www.rikai.com/library/kanjitables/kanji_codes.unicode.shtml 
function isKanjiAt(str: string, index: number) {
    const code = str.codePointAt(index);
    if (!code) {
        return false;
    }
    return (code >= 0x4e00 && code <= 0x9faf) || // CJK unified ideographs (common/uncommon kanji)
        (code >= 0x3400 && code <= 0x4dbf);   // CJK unified ideographs (rare kanji)
}

function getTokenReading(surfaceForm: string, hiragana: string, tokenStart: number, tokenEnd: number) {
    // Example: 見る and みる both share a common tail (る).  Chop the る off and return the remainder.
    const tail = surfaceForm.substring(tokenEnd);
    const tailReading = toHiragana(tail);
    const readingEnd = tailReading.length ? hiragana.search(tailReading) : hiragana.length;
    return hiragana.substring(tokenStart, readingEnd);
}

function toTokens(word: bunsetsu.Word): TokenProps[] {
    const surfaceForm = word.surfaceForm();
    if (!surfaceForm.length) {
        return [];
    }
    const katakana = word.reading(); // kuromoji gives us readings in katakana
    const hiragana = toHiragana(katakana);
    const tokens: TokenProps[] = [];
    let start = 0;
    let readingStart = 0;
    for (let end = 1; end <= surfaceForm.length; end++) {
        if (end != surfaceForm.length && // include the last chunk
            isKanjiAt(surfaceForm, start) === isKanjiAt(surfaceForm, end)) {
            continue;
        }
        const tokenReading = getTokenReading(surfaceForm, hiragana, readingStart, end);
        const tokenSurfaceForm = surfaceForm.substring(start, end);
        const showFurigana = tokenSurfaceForm !== tokenReading && surfaceForm !== katakana && tokenReading !== hiragana;
        const furigana = showFurigana ? tokenReading : undefined;
        const props = { surfaceForm: tokenSurfaceForm, furigana };
        tokens.push(props);
        start = end;
        readingStart += tokenReading.length;
    }
    return tokens;
}

interface WordProps {
    word: bunsetsu.Word,
}

function Word({ word }: WordProps) {
    const tokensProps = toTokens(word);
    return (
        <span className="hover:text-red-500 subtitle-word">
            {tokensProps.map((props, index) => {
                return (
                    <Token key={index} {...props} />
                );
            })}
        </span>
    );
}
export default Word;