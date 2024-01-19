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
import { Busy, DBStatusResult, DataSource, LookupWordMessage, ProgressType, RuntimeEvent, RuntimeMessage, Status } from '../../../util/events';
import { toHiragana } from '../../../util/lang';
import ProgressBar from './ProgressBar';
import { DBOperation } from '../../../database/database';

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
                case DataSource.JMDict:
                    return "dictionary"
                case DataSource.KanjiDic2:
                    return "kanji data";
                case DataSource.Tatoeba:
                    return "example sentences";
            }
        }
        switch (dbStatus.operation) {
            case DBOperation.Open:
                return `Establishing connection...`;
            case DBOperation.Upgrade:
                return "Upgrading database...";
            case DBOperation.FetchData:
                return `Fetch latest ${sourceText()}...`;
            case DBOperation.ParseData:
                return `Parsing latest ${sourceText()}...`;
            case DBOperation.PutData:
                return `Adding ${sourceText()} to database...`;
            default:
                return 'Loading...';
        }
    }
    return (
        <div className='p-8'>
            <ProgressBar id={"database-progress"} label={text()} progress={dbStatus.progress} units={'entries'} ></ProgressBar>
        </div>
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

        const message: RuntimeMessage = {
            event: RuntimeEvent.RequestDBStatus, data: undefined
        };
        chrome.runtime.sendMessage(message)
            .then(status => setDBStatus(status as DBStatusResult)) // todo: validate
            .catch(e => console.error(e));

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