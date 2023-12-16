import React from 'react';
import './Token.css'

function toHiragana(text: string | undefined): string {
    if (!text) {
        return "";
    }
    const result = [];
    for (let i = 0; i < text.length; i++) {
        const code = text.codePointAt(i);
        if (code && code >= 0x30A1 && code <= 0x30F6) {
            result.push(String.fromCodePoint(code - 0x60));
        }
    }
    return result.join('');
}

interface TokenProps {
    surfaceForm: string;
    reading: string;
}

function Token(props: TokenProps) {
    const furigana = toHiragana(props.reading);
    const showFurigana = !(props.surfaceForm === furigana || props.surfaceForm === props.reading);
    if (showFurigana) {
        return (
            <span className="jimakun-subtitle-token">
                <ruby>
                    {props.surfaceForm}<rp>(</rp><rt>{furigana}</rt><rp>)</rp>
                </ruby>
            </span>
        );
    }
    return (
        <span className="jimakun-subtitle-token">
            {props.surfaceForm}
        </span>
    );

}
export default Token;