import React, { useEffect, useState } from 'react';
import * as bunsetsu from "bunsetsu";
import Footer from './Footer';
import Definitions from './Definitions';
import Header from './Header';
import Tabs from './Tabs';
import Examples from './Examples';
import Kanji from './Kanji';
import Notes from './Notes';
import type { JMdict, JMdictWord } from "@scriptin/jmdict-simplified-types";
import { LookupWordMessage, RuntimeEvent, RuntimeMessage } from '../../../util/events';

async function lookupWord(word: bunsetsu.Word): Promise<JMdictWord | undefined> {
    const data: LookupWordMessage = {
        surfaceForm: word.surfaceForm(),
        baseForm: word.basicForm() ?? "",
        reading: word.reading() ?? "",
    };
    const message: RuntimeMessage = { event: RuntimeEvent.LookupWord, data: data };
    return await chrome.runtime.sendMessage(message);
}

export interface CardProps {
    word: bunsetsu.Word;
}

function Card({ word }: CardProps) {
    const [selectedTab, setSelectedTab] = useState(0);
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

    if (!entry) {
        // todo: show loading screen
        return <></>
    }

    const tabs = [
        {
            label: "Definitions",
            content: <Definitions word={word} entry={entry}></Definitions>
        },
        {
            label: "Kanji",
            content: <Kanji word={word}></Kanji>
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
        <div className="bg-white rounded-lg text-black px-12 py-4">
            <Header word={word}></Header>
            <Tabs tabs={tabs} selectedIndex={selectedTab}></Tabs>
            <Footer></Footer>
        </div>
    );
}
export default Card;