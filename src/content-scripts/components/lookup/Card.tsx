import React, { useContext, useEffect, useState } from 'react';
import * as bunsetsu from "bunsetsu";
import Footer from './Footer';
import Definitions from './Definitions';
import Header from './Header';
import Tabs from './Tabs';
import Examples from './Examples';
import Kanji from './Kanji';
import Notes from './Notes';
import type { JMdictWord } from "@scriptin/jmdict-simplified-types";
import { extractKanji, toHiragana } from '../../../common/lang';
import { RuntimeMessage, RuntimeEvent, CountSentencesMessage, CountKanjiMessage } from '../../../common/events';
import { ChromeExtensionContext, ExtensionContext } from '../../contexts/ExtensionContext';
import { sendMessage } from '../../util/browser-runtime';

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

    if (!details) {
        return <></>; // TODO: better loading indicator
    }

    const tabs = [
        {
            label: "Definitions",
            content: <Definitions entry={details.entry}></Definitions>,
            disabled: false,
        },
        {
            label: "Kanji",
            content: <Kanji entry={details.entry}></Kanji>,
            disabled: details.numKanji <= 0,
        },
        {
            label: "Examples",
            content: <Examples word={word} numSentences={details.numSentences}></Examples>,
            disabled: details.numSentences <= 0,
        },
        {
            label: "Notes",
            content: <Notes word={word}></Notes>,
            disabled: false,
        }
    ];

    return (
        <div className="bg-white rounded-lg text-black min-w-fit max-w-[40vw] min-h-fit max-h-[60vh] px-12 py-6">
            <div className='flex flex-col gap-y-6 h-full'>
                <div className='flex-none'>
                    <Header word={word} entry={details.entry} onCloseClicked={onCardClosed}></Header>
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