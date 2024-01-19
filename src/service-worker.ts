import { IDBUpgradeContext, IDBWrapper, DBStoreOperation, DBStore } from "./database/database";
import { JMDictStore, JMDictStoreUpgrade } from "./database/jmdict";
import { TatoebaStore, TatoebaStoreUpgrade } from "./database/tatoeba";
import { KanjiDic2Store, KanjiDic2StoreUpgrade } from "./database/kanjidic2";
import { DataSource, MovieChangedMessage, Operation, RuntimeEvent, RuntimeMessage, SeekCueMessage, SeekDirection } from "./util/events";
import * as DBStatusNotifier from './dbstatus-notifier'

const DB_NAME = 'jimakun';
const DB_VERSION = 1; // todo
const DB_OPEN_MAX_ATTEMPTS = 5;

const NEXT_CUE_ID = 'next-cue';
const PREV_CUE_ID = 'prev-cue';
const REPEAT_CUE_ID = 'repeat-cue';
const TOGGLE_SUBS_ID = 'toggle-subs';

function extractMovieId(url: string) {
    const regex = new RegExp('netflix.com/watch/([0-9]+)');
    const match = regex.exec(url);
    return match ? match[1] : null;
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!tab.active) {
        return;
    }
    const url = changeInfo.url ?? tab.url;
    if (!url) {
        return;
    }
    const movieId = extractMovieId(url);
    if (movieId) {
        const data: MovieChangedMessage = { movieId: movieId };
        const message: RuntimeMessage = { event: RuntimeEvent.MovieUpdated, data: data };
        chrome.tabs.sendMessage(tabId, message);
    }
});

chrome.commands.onCommand.addListener(function (command) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs) {
            return;
        }
        const tabId = tabs[0].id;
        if (!tabId) {
            return;
        }
        switch (command) {
            case NEXT_CUE_ID: {
                const data: SeekCueMessage = { direction: SeekDirection.Next };
                const message: RuntimeMessage = { event: RuntimeEvent.SeekCue, data: data };
                chrome.tabs.sendMessage(tabId, message);
                break;
            }
            case REPEAT_CUE_ID: {
                const data: SeekCueMessage = { direction: SeekDirection.Repeat };
                const message: RuntimeMessage = { event: RuntimeEvent.SeekCue, data: data };
                chrome.tabs.sendMessage(tabId, message);
                break;
            }
            case PREV_CUE_ID: {
                const data: SeekCueMessage = { direction: SeekDirection.Previous };
                const message: RuntimeMessage = { event: RuntimeEvent.SeekCue, data: data };
                chrome.tabs.sendMessage(tabId, message);
                break;
            }
            case TOGGLE_SUBS_ID: {
                const message: RuntimeMessage = { event: RuntimeEvent.ToggleSubs, data: null };
                chrome.tabs.sendMessage(tabId, message);
                break;
            }
        }
    });
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    switch (request.event) {
        case RuntimeEvent.RequestDBStatus: {
            break;
        }
        case RuntimeEvent.LookupWord: {
            const message = request.data;
            JMDictStore.open(DB_NAME, DB_VERSION, onDBUpgrade)
                .then(dict => {
                    dict.lookupBestMatch(message)
                        .then(word => sendResponse(word));
                });
            break;
        }
        case RuntimeEvent.LookupKanji: {
            const message = request.data;
            KanjiDic2Store.open(DB_NAME, DB_VERSION, onDBUpgrade)
                .then(store => {
                    store.lookup(message)
                        .then(kanji => sendResponse(kanji));
                });
            break;
        }
        case RuntimeEvent.LookupSentences: {
            const message = request.data;
            TatoebaStore.open(DB_NAME, DB_VERSION, onDBUpgrade)
                .then(store => {
                    store.lookup(message)
                        .then(result => sendResponse(result));
                });
            break;
        }
        case RuntimeEvent.PlayAudio: {
            const message = request.data;
            if (!message.utterance) {
                return;
            }
            chrome.tts.speak(message.utterance, { lang: 'ja' });
            break;
        }
        default:
            console.warn("unrecognized request", request);
    }
    return true; // result will be returned async
}
);

async function onDBUpgrade(db: IDBUpgradeContext) {
    const ctx = db.getContext();
    const upgrades = [
        new JMDictStoreUpgrade(ctx),
        new KanjiDic2StoreUpgrade(ctx),
        new TatoebaStoreUpgrade(ctx),
    ];
    upgrades.map(x => x.apply());
    return db.commit();
}

async function initializeDB() {
    try {
        const onProgressTick = (op: DBStoreOperation, value: number, max: number, source: DataSource) => {
            switch (op) {
                case DBStoreOperation.LoadData:
                    DBStatusNotifier.setDBStatusBusy(Operation.LoadData, value, max, source);
                    break;
                case DBStoreOperation.PutData:
                    DBStatusNotifier.setDBStatusBusy(Operation.PutData, value, max, source);
                    break;
                case DBStoreOperation.Index:
                    DBStatusNotifier.setDBStatusBusy(Operation.IndexStore, value, max, source);
                    break;
            }
        };
        const db = await IDBWrapper.open(DB_NAME, DB_VERSION, onDBUpgrade, DB_OPEN_MAX_ATTEMPTS);
        // make sure object stores have the latest data
        const jmdict = await JMDictStore.openWith(db);
        await jmdict.populate((op, value, max) => onProgressTick(op, value, max, DataSource.Dictionary));
        const kanjidic2 = await KanjiDic2Store.openWith(db);
        await kanjidic2.populate((op, value, max) => onProgressTick(op, value, max, DataSource.Kanji));
        const tatoeba = await TatoebaStore.openWith(db);
        await tatoeba.populate((op, value, max) => onProgressTick(op, value, max, DataSource.ExampleSentences));
    } catch (e) {
        console.error(e);
    }
}

chrome.runtime.onStartup.addListener(() => {
    initializeDB();
});

chrome.runtime.onInstalled.addListener(() => {
    initializeDB();
});