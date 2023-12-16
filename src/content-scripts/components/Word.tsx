import Token from "./Token";
import React from 'react';
import * as bunsetsu from "bunsetsu";

interface WordProps {
    word: bunsetsu.Word,
}

function Word({ word }: WordProps) {
    /*
    const tokenElems = tokens.map((token, index) => {
        return (
            <Token key={index} token={token} />
        );
    });
    */
    return (
        <span className="hover:text-red-500">
            {word.surfaceForm()}
        </span>
    );
}
export default Word;