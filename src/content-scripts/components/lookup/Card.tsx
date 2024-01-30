import React, { useContext, useEffect, useState } from 'react';
import * as bunsetsu from "bunsetsu";
import Footer from './Footer';
import Definitions from './Definitions';
import Header from './Header';
import Tabs from './Tabs';
import Examples from './Examples';
import Kanji from './Kanji';
import type { JMdictWord } from "@scriptin/jmdict-simplified-types";
import { extractKanji, toHiragana } from '../../../common/lang';
import { RuntimeMessage, RuntimeEvent, CountSentencesMessage, CountKanjiMessage } from '../../../common/events';
import { ChromeExtensionContext, ExtensionContext } from '../../contexts/ExtensionContext';
import { sendMessage } from '../../util/browser-runtime';
import Conjugation from './Conjugation';

async function countKanji(entry: JMdictWord, context: ExtensionContext): Promise<number> {
    const kanjiWords = entry.kanji.map(k => k.text);
    const kanji = kanjiWords.flatMap(word => extractKanji(word));
    const unique = kanji.filter((c, index, arr) => arr.indexOf(c) === index);
    const data: CountKanjiMessage = { kanji: unique };
    const message: RuntimeMessage = { event: RuntimeEvent.LookupKanji, data: data };
    return sendMessage(message, context);
}

async function countSentences(word: bunsetsu.Word, context: ExtensionContext): Promise<number> {
    const data: CountSentencesMessage = {
        searchTerm: word.baseForm ?? toHiragana(word.reading),
    };
    const message: RuntimeMessage = { event: RuntimeEvent.CountSentences, data: data };
    return sendMessage(message, context);
}

function hasConjugation(word: bunsetsu.Word) {
    if (!word.tokens.length) {
        return false;
    }
    const detail = word.tokens[0].detail;
    return detail?.type === bunsetsu.DetailType.ConjugationDetail;
}

interface EntryDetails {
    entry: JMdictWord;
    numKanji: number;
    numSentences: number;
}

export interface CardProps {
    word: bunsetsu.Word;
    entry: JMdictWord;
    onCardClosed: () => void;
}

function Card({ word, entry, onCardClosed }: CardProps) {
    const [details, setDetails] = useState<EntryDetails | null>(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const context = useContext(ChromeExtensionContext);

    useEffect(() => {
        (async () => {
            const numKanji = await countKanji(entry, context);
            const numSentences = await countSentences(word, context);
            const details = {
                entry,
                numKanji,
                numSentences,
            }
            setDetails(details);
        })();
    }, []);

    const dictEntry = details?.entry || entry;
    const tabs = [
        {
            label: "Definitions",
            content: <Definitions entry={dictEntry}></Definitions>,
            disabled: false,
        },
        {
            label: "Conjugation",
            content: <Conjugation word={word}></Conjugation>,
            disabled: !hasConjugation(word),
        },
        {
            label: "Kanji",
            content: <Kanji entry={dictEntry}></Kanji>,
            disabled: !details || details.numKanji <= 0,
        },
        {
            label: "Examples",
            content: <Examples word={word} numSentences={details?.numSentences}></Examples>,
            disabled: !details || details.numSentences <= 0,
        },
    ];

    return (
        <div className="bg-white rounded-lg text-black min-w-fit max-w-[40vw] min-h-fit max-h-[60vh] px-12 py-6">
            <div className='flex flex-col gap-y-6 h-full'>
                <div className='flex-none'>
                    <Header word={word} entry={dictEntry} onCloseClicked={onCardClosed}></Header>
                </div>
                <div className='flex-initial overflow-y-hidden'>
                    <Tabs tabs={tabs} selectedIndex={selectedTab} onSelected={(index) => setSelectedTab(index)}></Tabs>
                </div>
                <div className='flex-none'>
                    <Footer></Footer>
                </div>
            </div>
        </div>
    );
}
export default Card;