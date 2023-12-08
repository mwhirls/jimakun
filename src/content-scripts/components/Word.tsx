import Token from "./Token";
import React from 'react';
import * as tokun from "tokun";

interface WordProps {
    word: tokun.Word,
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
            { }
        </span>
    );
}
export default Word;