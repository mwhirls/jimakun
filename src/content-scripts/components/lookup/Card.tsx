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
import { DBStatusResult, LookupWordMessage, RuntimeEvent, RuntimeMessage, Status } from '../../../common/events';
import { toHiragana } from '../../../common/lang';
import Spinner from './Spinner';
import * as DBStatusNotifier from './../../../dbstatus-notifier';
import DatabaseBusy from '../../../common/components/DatabaseBusy';
import DatabaseBlocked from '../../../common/components/DatabaseBlocked';
import DatabaseError from '../../../common/components/DatabaseError';

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
                return <DatabaseBlocked dbStatus={dbStatus.status}></DatabaseBlocked>
            case Status.Busy:
                return <DatabaseBusy dbStatus={dbStatus.status}></DatabaseBusy>
            case Status.ErrorOccurred:
                return <DatabaseError dbStatus={dbStatus.status}></DatabaseError>
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