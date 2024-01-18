import React, { useEffect, useState } from 'react';
import * as bunsetsu from "bunsetsu";
import Footer from './Footer';
import Definitions from './Definitions';
import Header from './Header';
import Tabs from './Tabs';
import Examples from './Examples';
import Kanji from './Kanji';
import Notes from './Notes';
import type { JMdictWord } from "@scriptin/jmdict-simplified-types";
import { LookupWordMessage, RuntimeEvent, RuntimeMessage } from '../../../util/events';
import { toHiragana } from '../../../util/lang';
import ProgressBar from './ProgressBar';

async function lookupWord(word: bunsetsu.Word): Promise<JMdictWord | undefined> {
    const data: LookupWordMessage = {
        surfaceForm: word.surfaceForm(),
        baseForm: word.basicForm() ?? "",
        katakana: word.reading() ?? "",
        hiragana: toHiragana(word.reading()),
    };
    const message: RuntimeMessage = { event: RuntimeEvent.LookupWord, data: data };
    return await chrome.runtime.sendMessage(message);
}

function LoadingScreen() {
    return (
        <>
            <ProgressBar id={"database-update-progress"} label={"Updating database..."} maxValue={100} units={'%'} ></ProgressBar>
            <ProgressBar id={"dictionary-initialization-progress"} label={"Initializing dictionary..."} maxValue={100} units={'%'} ></ProgressBar>
        </>
    )
}

interface EntryDetailsProps {
    word: bunsetsu.Word;
    entry: JMdictWord;
}

function EntryDetails({ word, entry }: EntryDetailsProps) {
    const [selectedTab, setSelectedTab] = useState(0);

    const tabs = [
        {
            label: "Definitions",
            content: <Definitions word={word} entry={entry}></Definitions>
        },
        {
            label: "Kanji",
            content: <Kanji entry={entry}></Kanji>
        },
        {
            label: "Examples",
            content: <Examples word={word}></Examples>
        },
        {
            label: "Notes",
            content: <Notes word={word}></Notes>
        }
    ];

    return (
        <>
            <div className='flex-none'>
                <Header word={word} entry={entry}></Header>
            </div>
            <div className='flex-initial overflow-y-hidden'>
                <Tabs tabs={tabs} selectedIndex={selectedTab} onSelected={(index) => setSelectedTab(index)}></Tabs>
            </div>
            <div className='flex-none'>
                <Footer></Footer>
            </div>
        </>
    )
}

export interface CardProps {
    word: bunsetsu.Word;
}

function Card({ word }: CardProps) {

    const [entry, setEntry] = useState<JMdictWord | null>(null);

    useEffect(() => {
        (async () => {
            const entry = await lookupWord(word);
            if (!entry) {
                // todo: how to display this to the user?
                return;
            }
            setEntry(entry);
        })();
    }, []);

    const showEntry = false; // TEMP FOR TESTING

    return (
        <div className="flex flex-col gap-y-6 bg-white rounded-lg text-black max-w-[40vw] max-h-[60vh] px-12 py-6">
            {showEntry && entry ? <EntryDetails word={word} entry={entry}></EntryDetails> : <LoadingScreen></LoadingScreen>}
        </div>
    );
}
export default Card;