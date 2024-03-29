import React, { useContext, useEffect, useState } from 'react';
import * as bunsetsu from "bunsetsu";
import { TatoebaSentence } from '../../../common/tatoeba-types';
import { LookupSentencesMessage, LookupSentencesResult, RuntimeEvent, RuntimeMessage } from '../../../common/events';
import { toHiragana } from '../../../common/lang';
import Pagination from '../../../common/components/Pagination'
import { ChromeExtensionContext, ExtensionContext } from '../../contexts/ExtensionContext';
import { sendMessage } from '../../util/browser-runtime';

const SENTENCES_PER_PAGE = 20;

async function lookupSentences(word: bunsetsu.Word, page: number, context: ExtensionContext): Promise<LookupSentencesResult> {
    const data: LookupSentencesMessage = {
        searchTerm: word.baseForm ?? toHiragana(word.reading),
        page,
        perPage: SENTENCES_PER_PAGE,
    };
    const message: RuntimeMessage = { event: RuntimeEvent.enum.LookupSentences, data: data };
    return sendMessage(message, context);
}

export interface ExamplesProps {
    word: bunsetsu.Word;
    numSentences?: number;
    containerRef: React.RefObject<HTMLDivElement>;
}

function Examples({ word, numSentences, containerRef }: ExamplesProps) {
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
            if (containerRef.current) {
                containerRef.current.scrollTop = 0;
            }
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
            <h5 className='text-3xl font-semibold'>{`Sentences - ${numSentences} found`}</h5>
            <ul className='my-2 leading-normal text-3xl font-normal text-black'>
                {
                    sentences.map((sentence, index) => {
                        return (
                            <li key={index} className='pt-4'>
                                <p>{sentence.text}</p>
                                <p className='text-2xl text-slate-400'>{sentence.translation}</p>
                            </li>
                        );
                    })
                }
            </ul>
            {pagination()}
        </div >
    );
}
export default Examples;