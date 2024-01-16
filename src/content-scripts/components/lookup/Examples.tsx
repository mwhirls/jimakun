import React, { useEffect, useState } from 'react';
import * as bunsetsu from "bunsetsu";
import { CorpusSentence } from '../../../util/tanaka-corpus-types';
import { LookupSentencesMessage, LookupSentencesResult, RuntimeEvent, RuntimeMessage } from '../../../util/events';
import { toHiragana } from '../../../util/lang';

const SENTENCES_PER_PAGE = 20;

async function lookupSentences(word: bunsetsu.Word, page: number): Promise<LookupSentencesResult> {
    const data: LookupSentencesMessage = {
        searchTerm: word.basicForm() ?? toHiragana(word.reading()),
        page,
        perPage: SENTENCES_PER_PAGE,
    };
    const message: RuntimeMessage = { event: RuntimeEvent.LookupSentences, data: data };
    return await chrome.runtime.sendMessage(message);
}

export interface DefinitionsProps {
    word: bunsetsu.Word;
}

function Definitions({ word }: DefinitionsProps) {
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [numPages, setNumPages] = useState<number | null>(0);
    const [sentences, setSentences] = useState<CorpusSentence[]>([]);

    useEffect(() => {
        (async () => {
            const result = await lookupSentences(word, 0);
            if (!result) {
                // todo: how to display this to the user?
                return;
            }
            setNumPages(result.pages);
            setSentences(result.sentences);
        })();
    }, []);

    return (
        <div>
            <h3>{`Sentences - ${count} found`}</h3>
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