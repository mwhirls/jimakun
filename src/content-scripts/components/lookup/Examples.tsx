import React, { useEffect, useState } from 'react';
import * as bunsetsu from "bunsetsu";
import { CorpusSentence } from '../../../util/tanaka-corpus-types';
import { LookupSentencesMessage, RuntimeEvent, RuntimeMessage } from '../../../util/events';
import { toHiragana } from '../../../util/lang';

async function lookupSentences(word: bunsetsu.Word): Promise<CorpusSentence[]> {
    const data: LookupSentencesMessage = {
        surfaceForm: word.surfaceForm(),
        baseForm: word.basicForm() ?? "",
        katakana: word.reading() ?? "",
        hiragana: toHiragana(word.reading()),
    };
    const message: RuntimeMessage = { event: RuntimeEvent.LookupSentences, data: data };
    return await chrome.runtime.sendMessage(message);
}

export interface DefinitionsProps {
    word: bunsetsu.Word;
}

function Definitions({ word }: DefinitionsProps) {
    const [sentences, setSentences] = useState<CorpusSentence[]>([]);

    useEffect(() => {
        (async () => {
            const sentences = await lookupSentences(word);
            if (!sentences) {
                // todo: how to display this to the user?
                return;
            }
            setSentences(sentences);
        })();
    }, []);

    return (
        <div>
            {
                sentences.map((sentence, index) => {
                    return (
                        <div key={index} className='mt-6 leading-tight'>
                            <p className='text-4xl font-normal text-black'>{sentence.text}</p>
                            <p className='ml-4 text-3xl font-light text-slate-400'>{sentence.translation}</p>
                        </div>
                    );
                })
            }
        </div >
    );
}
export default Definitions;