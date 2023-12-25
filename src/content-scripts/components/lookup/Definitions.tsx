import React from 'react';
import * as bunsetsu from "bunsetsu";

export interface DefinitionsProps {
    word: bunsetsu.Word;
}

function Definitions({ word }: DefinitionsProps) {
    return (
        <div>
            <h5>Part of Speech</h5>
            <p>This is the first definition of the word</p>
            <h5>Part of Speech</h5>
            <p>This is the second definition of the word</p>
            <p>This is another definition of the same part of speech</p>
        </div>
    );
}
export default Definitions;