import React from 'react';
import * as bunsetsu from "bunsetsu";

export interface DefinitionsProps {
    word: bunsetsu.Word;
}

function Definitions({ word }: DefinitionsProps) {
    return (
        <div>
            <h5>Kanji #1</h5>
            <p>Some kanji info</p>
            <h5>Kanji #2</h5>
            <p>Some kanji info</p>
        </div>
    );
}
export default Definitions;