import { IDBUpgradeContext, IDBWrapper, DBOperation, IDBObjectStoreWrapper } from "./database/database";
import { JMDictStore, JMDictStoreUpgrade } from "./database/jmdict";
import { TatoebaStore, TatoebaStoreUpgrade } from "./database/tatoeba";
import { KanjiDic2Store, KanjiDic2StoreUpgrade } from "./database/kanjidic2";
import { DataSource, LookupKanjiMessage, LookupSentencesMessage, LookupWordMessage, MovieChangedMessage, PlayAudioMessage, RuntimeEvent, RuntimeMessage, SeekCueMessage, SeekDirection } from "./util/events";
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

async function requestDatabaseStatus(sendResponse: (response?: unknown) => void) {
    try {
        const status = await DBStatusNotifier.getDBStatus();
        sendResponse(status);
    } catch (e) {
        sendResponse(undefined); // TODO: better error handling
    }
}

async function lookupWord(message: LookupWordMessage, sendResponse: (response?: unknown) => void) {
    try {
        const dict = await JMDictStore.open(DB_NAME, DB_VERSION, onDBUpgrade);
        const word = await dict.lookupBestMatch(message);
        sendResponse(word);
    } catch (e) {
        sendResponse(undefined); // TODO: better error handling
    }
}

async function lookupKanji(message: LookupKanjiMessage, sendResponse: (response?: unknown) => void) {
    try {
        const dict = await KanjiDic2Store.open(DB_NAME, DB_VERSION, onDBUpgrade);
        const kanji = await dict.lookup(message);
        sendResponse(kanji);
    } catch (e) {
        sendResponse(undefined); // TODO: better error handling
    }
}

async function lookupSentences(message: LookupSentencesMessage, sendResponse: (response?: unknown) => void) {
    try {
        const store = await TatoebaStore.open(DB_NAME, DB_VERSION, onDBUpgrade);
        const kanji = await store.lookup(message);
        sendResponse(kanji);
    } catch (e) {
        sendResponse(undefined); // TODO: better error handling
    }
}

function playAudio(message: PlayAudioMessage) {
    if (!message.utterance) {
        return;
    }
    chrome.tts.speak(message.utterance, { lang: 'ja' });
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    const message = request.data; // todo: validate
    switch (request.event) {
        case RuntimeEvent.RequestDBStatus:
            requestDatabaseStatus(sendResponse);
            break;
        case RuntimeEvent.LookupWord:
            lookupWord(message as LookupWordMessage, sendResponse);
            break;
        case RuntimeEvent.LookupKanji:
            lookupKanji(message as LookupKanjiMessage, sendResponse);
            break;
        case RuntimeEvent.LookupSentences:
            lookupSentences(message as LookupSentencesMessage, sendResponse);
            break;
        case RuntimeEvent.PlayAudio:
            playAudio(message as PlayAudioMessage);
            return false;
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

async function populateObjectStore(store: IDBObjectStoreWrapper) {
    const source = Object.values(DataSource).find(x => x === store.name());
    await DBStatusNotifier.notifyDBStatusBusyIndeterminate(DBOperation.Open);
    await store.populate(async (operation: DBOperation, value?: number, max?: number) => {
        if (value && max) {
            return DBStatusNotifier.notifyDBStatusBusyDeterminate(operation, value, max, source);
        }
        return DBStatusNotifier.notifyDBStatusBusyIndeterminate(operation, source);
    });
}

async function populateDatabase(db: IDBWrapper) {
    // make sure object stores have the latest data
    const objectStores = [
        new JMDictStore(db),
        new KanjiDic2Store(db),
        new TatoebaStore(db),
    ];
    for (const store of objectStores) {
        await populateObjectStore(store)
    }
}

async function openDatabase() {
    await DBStatusNotifier.notifyDBStatusBusyIndeterminate(DBOperation.Open);
    const db = await IDBWrapper.open(DB_NAME, DB_VERSION, onDBUpgrade, DB_OPEN_MAX_ATTEMPTS);
    if (db.upgraded) {
        await populateDatabase(db);
    }
    await DBStatusNotifier.notifyDBStatusReady();
    return db;
}

chrome.runtime.onStartup.addListener(() => {
    console.debug('onStartup event');
    try {
        openDatabase();
    } catch (e) {
        console.error(e);
    }
});

chrome.runtime.onInstalled.addListener(() => {
    console.debug('onInstalled event');
    try {
        openDatabase();
    } catch (e) {
        console.error(e);
    }
});