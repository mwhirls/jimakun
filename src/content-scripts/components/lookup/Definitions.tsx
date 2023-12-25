import React from 'react';
import * as bunsetsu from "bunsetsu";

export interface DefinitionsProps {
    word: bunsetsu.Word;
}

function Definitions({ word }: DefinitionsProps) {
    return (
        <div>
            <h5 className='text-3xl text-slate-400 font-light'>Part of Speech</h5>
            <p className='text-4xl text-black font-normal'>This is the first definition of the word</p>
            <h5 className='text-3xl text-slate-400 font-light'>Part of Speech</h5>
            <p className='text-4xl text-black font-normal'>This is the second definition of the word</p>
            <p className='text-4xl text-black font-normal'>This is another definition of the same part of speech</p>
        </div>
    );
}
export default Definitions;