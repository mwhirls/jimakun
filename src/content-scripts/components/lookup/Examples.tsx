import React, { useContext, useEffect, useState } from 'react';
import * as bunsetsu from "bunsetsu";
import { TatoebaSentence } from '../../../common/tatoeba-types';
import { LookupSentencesMessage, LookupSentencesResult, RuntimeEvent, RuntimeMessage } from '../../../common/events';
import { toHiragana } from '../../../common/lang';
import Pagination from './Pagination';
import { ChromeExtensionContext, ExtensionContext } from '../../contexts/ExtensionContext';
import { sendMessage } from '../../util/browser-runtime';

const SENTENCES_PER_PAGE = 20;

async function lookupSentences(word: bunsetsu.Word, page: number, context: ExtensionContext): Promise<LookupSentencesResult> {
    const data: LookupSentencesMessage = {
        searchTerm: word.basicForm() ?? toHiragana(word.reading()),
        page,
        perPage: SENTENCES_PER_PAGE,
    };
    const message: RuntimeMessage = { event: RuntimeEvent.LookupSentences, data: data };
    return sendMessage(message, context);
}

export interface ExamplesProps {
    word: bunsetsu.Word;
    numSentences: number;
}

function Examples({ word, numSentences }: ExamplesProps) {
    const [numPages, setNumPages] = useState<number | null>(0);
    const [sentences, setSentences] = useState<TatoebaSentence[]>([]);
    const context = useContext(ChromeExtensionContext);

    useEffect(() => {
        onPageSelected(0);
    }, []);

    const onPageSelected = async (page: number) => {
        try {
            const result = await lookupSentences(word, page, context);
            setNumPages(result.pages);
            setSentences(result.sentences);
        } catch (e) {
            console.error(e);
        }
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
            <h3>{`Sentences - ${numSentences} found`}</h3>
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