import { IDBUpgradeContext, IDBWrapper, DBOperation, IDBObjectStoreWrapper } from "./database/database";
import { JMDictStore, JMDictStoreUpgrade } from "./database/jmdict";
import { TatoebaStore, TatoebaStoreUpgrade } from "./database/tatoeba";
import { KanjiDic2Store, KanjiDic2StoreUpgrade } from "./database/kanjidic2";
import { CountSentencesMessage, LookupKanjiMessage, LookupSentencesMessage, LookupWordMessage, PlayAudioMessage, RuntimeEvent, RuntimeMessage, SeekCueMessage, SeekDirection } from "./common/events";
import * as DBStatusManager from './database/dbstatus'
import * as tabs from './tabs'
import { SessionStorageObject } from "./storage/sesson-storage";
import { DataSource } from "./database/dbstatus";

const DB_NAME = 'jimakun';
const DB_VERSION = 1; // todo
const DB_OPEN_MAX_ATTEMPTS = 5;

const MOVIE_KEY = 'lastMovieId';

enum Command {
    NextCue = 'next-cue',
    PrevCue = 'prev-cue',
    RepeatCue = 'repeat-cue',
    ToggleSubs = 'toggle-subs',
}

function extractMovieId(url: string): number | undefined {
    const regex = new RegExp('netflix.com/watch/([0-9]+)');
    const match = regex.exec(url);
    if (!match) {
        return undefined;
    }
    const movie = match[1];
    return Number.isNaN(movie) ? undefined : Number.parseInt(movie);
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
        const storage = new SessionStorageObject<number>(MOVIE_KEY);
        storage.set(movieId);
    }
});

chrome.commands.onCommand.addListener(command => {
    switch (command) {
        case Command.NextCue: {
            const data: SeekCueMessage = { direction: SeekDirection.Next };
            const message: RuntimeMessage = { event: RuntimeEvent.SeekCue, data: data };
            tabs.sendMessageToActive(message);
            break;
        }
        case Command.RepeatCue: {
            const data: SeekCueMessage = { direction: SeekDirection.Repeat };
            const message: RuntimeMessage = { event: RuntimeEvent.SeekCue, data: data };
            tabs.sendMessageToActive(message);
            break;
        }
        case Command.PrevCue: {
            const data: SeekCueMessage = { direction: SeekDirection.Previous };
            const message: RuntimeMessage = { event: RuntimeEvent.SeekCue, data: data };
            tabs.sendMessageToActive(message);
            break;
        }
        case Command.ToggleSubs: {
            const message: RuntimeMessage = { event: RuntimeEvent.ToggleSubs, data: null };
            tabs.sendMessageToActive(message);
            break;
        }
    }
});

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

async function countSentences(message: CountSentencesMessage, sendResponse: (response?: unknown) => void) {
    try {
        const store = await TatoebaStore.open(DB_NAME, DB_VERSION, onDBUpgrade);
        const count = await store.count(message);
        sendResponse(count);
    } catch (e) {
        sendResponse(0); // TODO: better error handling
    }
}

async function lookupSentences(message: LookupSentencesMessage, sendResponse: (response?: unknown) => void) {
    try {
        const store = await TatoebaStore.open(DB_NAME, DB_VERSION, onDBUpgrade);
        const sentences = await store.lookup(message);
        sendResponse(sentences);
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
        case RuntimeEvent.LookupWord:
            lookupWord(message as LookupWordMessage, sendResponse);
            break;
        case RuntimeEvent.LookupKanji:
            lookupKanji(message as LookupKanjiMessage, sendResponse);
            break;
        case RuntimeEvent.CountSentences:
            countSentences(message as CountSentencesMessage, sendResponse);
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
    await DBStatusManager.setDBStatusBusyIndeterminate(DBOperation.Open);
    await store.populate(async (operation: DBOperation, value?: number, max?: number) => {
        if (value && max) {
            return DBStatusManager.setDBStatusBusyDeterminate(operation, value, max, source);
        }
        return DBStatusManager.setDBStatusBusyIndeterminate(operation, source);
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

async function initializeDatabase() {
    try {
        await DBStatusManager.setDBStatusBusyIndeterminate(DBOperation.Open);
        const db = await IDBWrapper.open(DB_NAME, DB_VERSION, onDBUpgrade, DB_OPEN_MAX_ATTEMPTS);
        await populateDatabase(db);
        await DBStatusManager.setDBStatusReady();
    } catch (e: unknown) {
        if (e instanceof Error) {
            DBStatusManager.setDBStatusError(e);
        } else {
            DBStatusManager.setDBStatusError(new Error('unknown error'));
        }
    }
}

async function initializeApp() {
    try {
        // session storage can't be accessed from content scripts by default
        chrome.storage.session.setAccessLevel({
            accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS'
        });
        await DBStatusManager.clearStatus()
        initializeDatabase();
    } catch (e) {
        console.error(e);
    }
}

chrome.runtime.onStartup.addListener(() => {
    console.debug('onStartup event');
    initializeApp();
});

chrome.runtime.onInstalled.addListener(() => {
    console.debug('onInstalled event');
    initializeApp();
});