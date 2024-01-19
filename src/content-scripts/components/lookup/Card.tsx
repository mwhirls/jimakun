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
import { Blocked, Busy, DBStatusResult, DataSource, LookupWordMessage, Operation, Ready, RuntimeEvent, RuntimeMessage, Status } from '../../../util/events';
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

interface LoadingScreenProps {
    dbStatus: Busy;
}

function LoadingScreen({ dbStatus }: LoadingScreenProps) {
    const text = () => {
        const sourceText = () => {
            switch (dbStatus.source) {
                case DataSource.Dictionary:
                    return "dictionary"
                case DataSource.Kanji:
                    return "kanji";
                case DataSource.ExampleSentences:
                    return "example sentences";
            }
        }
        switch (dbStatus.operation) {
            case Operation.Opening:
                return `Establishing connection...`;
            case Operation.UpgradeDatabase:
                return "Upgrading database...";
            case Operation.LoadData:
                return `Parsing ${sourceText()} data...`;
            case Operation.PutData:
                return `Updating ${sourceText()} database...`;
            case Operation.IndexStore:
                return `Indexing ${sourceText()} database...`;
        }
        throw new Error('unknown database update');
    }
    if (dbStatus.progress) {
        return (
            <div className='p-8'>
                <ProgressBar id={"database-progress"} label={text()} value={dbStatus.progress.value} maxValue={dbStatus.progress.max} units={'entries'} ></ProgressBar>
            </div>
        )
    }
    return (
        <></>
    )
}

interface EntryDetailsProps {
    word: bunsetsu.Word;
}

function EntryDetails({ word }: EntryDetailsProps) {
    const [entry, setEntry] = useState<JMdictWord | null>(null);
    const [selectedTab, setSelectedTab] = useState(0);

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
        return <></>; // TODO: better loading indicator
    }

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
    const [dbStatus, setDBStatus] = useState<DBStatusResult | null>(null);

    useEffect(() => {
        const runtimeListener = (message: RuntimeMessage) => {
            if (message.event === RuntimeEvent.ReportDBStatus) {
                const result = message.data as DBStatusResult; // TODO: validate
                setDBStatus(result);
            }
        };
        chrome.runtime.onMessage.addListener(runtimeListener);
        (async () => {
            try {
                const message: RuntimeMessage = { event: RuntimeEvent.RequestDBStatus, data: undefined };
                const result = await chrome.runtime.sendMessage(message) as DBStatusResult; // todo: validate
                setDBStatus(result);
            } catch (e) {
                console.error(e);
            }
        })();

        return () => {
            chrome.runtime.onMessage.removeListener(runtimeListener);
        }
    }, []);

    const content = () => {
        if (!dbStatus) {
            return <></>; // TODO
        }
        switch (dbStatus.status.type) {
            case Status.Ready:
                return <EntryDetails word={word}></EntryDetails>;
            case Status.Blocked:
                return <></>; // TODO
            case Status.Busy:
                return <LoadingScreen dbStatus={dbStatus.status}></LoadingScreen>;
            default:
                return <></>; // TODO
        }
    }

    return (
        <div className="flex flex-col gap-y-6 bg-white rounded-lg text-black max-w-[40vw] max-h-[60vh] px-12 py-6">
            {content()}
        </div>
    );
}
export default Card;