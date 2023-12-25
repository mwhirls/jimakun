import React from 'react';
import * as bunsetsu from "bunsetsu";

export interface DefinitionsProps {
    word: bunsetsu.Word;
}

function Definitions({ word }: DefinitionsProps) {
    return (
        <div>
            <p>Example sentence #1</p>
            <p>Example sentence #2</p>
        </div>
    );
}
export default Definitions;