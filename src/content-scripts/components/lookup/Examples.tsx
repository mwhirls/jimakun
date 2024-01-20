import React, { useEffect, useState } from 'react';
import * as bunsetsu from "bunsetsu";
import { TatoebaSentence } from '../../../util/tatoeba-types';
import { LookupSentencesMessage, LookupSentencesResult, RuntimeEvent, RuntimeMessage } from '../../../util/events';
import { toHiragana } from '../../../util/lang';
import Pagination from './Pagination';

const SENTENCES_PER_PAGE = 20;

async function lookupSentences(word: bunsetsu.Word, page: number): Promise<LookupSentencesResult> {
    const data: LookupSentencesMessage = {
        searchTerm: word.basicForm() ?? toHiragana(word.reading()),
        page,
        perPage: SENTENCES_PER_PAGE,
    };
    const message: RuntimeMessage = { event: RuntimeEvent.LookupSentences, data: data };
    return chrome.runtime.sendMessage(message);
}

export interface ExamplesProps {
    word: bunsetsu.Word;
}

function Examples({ word }: ExamplesProps) {
    const [count, setCount] = useState<number>(0);
    const [numPages, setNumPages] = useState<number | null>(0);
    const [sentences, setSentences] = useState<TatoebaSentence[]>([]);

    useEffect(() => {
        onPageSelected(0);
    }, []);

    const onPageSelected = (page: number) => {
        lookupSentences(word, page).then(result => {
            setNumPages(result.pages);
            setSentences(result.sentences);
        }).catch(e => {
            console.error(e);
        })
    }

    const pagination = () => {
        if (!numPages || numPages <= 1) {
            return <></>;
        }
        return (
            <div className='flex justify-center'>
                <Pagination numPages={numPages} onPageClicked={onPageSelected}></Pagination>
            </div>
        )
    }

    return (
        <div>
            <h3>{`Sentences - ${count} found`}</h3>
            {
                sentences.map((sentence, index) => {
                    return (
                        <div key={index} className='mt-6 leading-tight'>
                            <p className='text-3xl font-normal text-black'>{sentence.text}</p>
                            <p className='ml-4 text-3xl font-light text-slate-400'>{sentence.translation}</p>
                        </div>
                    );
                })
            }
            {pagination()}
        </div >
    );
}
export default Examples;