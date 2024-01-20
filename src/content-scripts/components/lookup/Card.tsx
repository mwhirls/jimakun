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
import { Busy, DBStatusResult, DataSource, LookupWordMessage, RuntimeEvent, RuntimeMessage, Status } from '../../../util/events';
import { toHiragana } from '../../../util/lang';
import ProgressBar from './ProgressBar';
import { DBOperation } from '../../../database/database';
import Spinner from './Spinner';
import * as DBStatusNotifier from './../../../dbstatus-notifier';
import { ProgressType } from '../../../util/progress';

async function lookupWord(word: bunsetsu.Word): Promise<JMdictWord | undefined> {
    const data: LookupWordMessage = {
        surfaceForm: word.surfaceForm(),
        baseForm: word.basicForm() ?? "",
        katakana: word.reading() ?? "",
        hiragana: toHiragana(word.reading()),
    };
    const message: RuntimeMessage = { event: RuntimeEvent.LookupWord, data: data };
    return chrome.runtime.sendMessage(message);
}

function Blocked() {
    return <>Database is blocked!</>;
}

interface BusyScreenProps {
    dbStatus: Busy;
}

function BusyScreen({ dbStatus }: BusyScreenProps) {
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
        <div className='flex flex-col justify-center items-center m-auto gap-8 w-[40rem] max-w-full h-[30rem] max-h-full'>
            <div>
                <div className='font-bold text-4xl mb-6 text-center'>{text()}</div>
                <div className='w-4/5 mx-auto'>
                    <ProgressBar progress={dbStatus.progress} units={'entries'} ></ProgressBar>
                </div>
            </div>
            <div className='text-2xl font-light text-center text-slate-400 w-11/12'>Please wait for the dictionaries to initialize... This may take a few minutes after installing or updating Jimakun.</div>
        </div>
    )
}

function ErrorOccurred() {
    return <>A database error occurred!</>;
}

function LoadingScreen() {
    return (
        <div className='flex justify-center items-center w-32 h-full m-auto'>
            <Spinner></Spinner>
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
        <div className='flex flex-col gap-y-6 h-full'>
            <div className='flex-none'>
                <Header word={word} entry={entry}></Header>
            </div>
            <div className='flex-initial overflow-y-hidden'>
                <Tabs tabs={tabs} selectedIndex={selectedTab} onSelected={(index) => setSelectedTab(index)}></Tabs>
            </div>
            <div className='flex-none'>
                <Footer></Footer>
            </div>
        </div>
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
        DBStatusNotifier.getDBStatus().then(result => setDBStatus(result));

        return () => {
            chrome.runtime.onMessage.removeListener(runtimeListener);
        }
    }, []);

    if (!dbStatus) {
        return <></>;
    }

    const content = () => {
        switch (dbStatus.status.type) {
            case Status.Ready:
                return <EntryDetails word={word}></EntryDetails>;
            case Status.Blocked:
                return <Blocked></Blocked>
            case Status.Busy:
                return <BusyScreen dbStatus={dbStatus.status}></BusyScreen>
            case Status.ErrorOccurred:
                return <ErrorOccurred></ErrorOccurred>
            default:
                return <LoadingScreen></LoadingScreen>;
        }
    }

    return (
        <div className="bg-white rounded-lg text-black min-w-fit max-w-[40vw] min-h-fit max-h-[60vh] px-12 py-6">
            {content()}
        </div>
    );
}
export default Card;