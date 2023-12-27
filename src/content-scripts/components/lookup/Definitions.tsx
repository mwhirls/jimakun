import React from 'react';
import * as bunsetsu from "bunsetsu";
import { JMdictWord } from '@scriptin/jmdict-simplified-types';

export interface DefinitionsProps {
    word: bunsetsu.Word;
    entry: JMdictWord;
}

function Definitions({ word, entry }: DefinitionsProps) {
    return (
        <div>
            {
                entry.sense.map((sense, senseIndex) => {
                    return (
                        <>
                            <h5 key={senseIndex} className='text-3xl text-slate-400 font-light'>{sense.partOfSpeech}</h5>
                            {
                                sense.gloss.map((gloss, glossIndex) => {
                                    return (
                                        <p key={glossIndex} className='text-4xl text-black font-normal'>{gloss.text}</p>
                                    )
                                })
                            }
                        </>
                    );
                })
            }
        </div>
    );
}
export default Definitions;