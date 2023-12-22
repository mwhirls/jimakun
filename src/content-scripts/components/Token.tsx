import React from 'react';

export interface TokenProps {
    surfaceForm: string;
    furigana: string | undefined;
}

function Token({ surfaceForm, furigana }: TokenProps) {
    if (furigana) {
        return (
            <span>
                <ruby>
                    {surfaceForm}<rp>(</rp><rt>{furigana}</rt><rp>)</rp>
                </ruby>
            </span>
        );
    }
    return (
        <span>
            {surfaceForm}
        </span>
    );

}
export default Token;