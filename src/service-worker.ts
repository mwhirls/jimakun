import { MovieChangedMessage, RuntimeEvent, RuntimeMessage, SeekCueMessage, SeekDirection } from "./util/events";
import type { JMdict, JMdictWord } from "@scriptin/jmdict-simplified-types";

const NEXT_CUE_ID = 'next-cue';
const PREV_CUE_ID = 'prev-cue';
const REPEAT_CUE_ID = 'repeat-cue';
const TOGGLE_SUBS_ID = 'toggle-subs';
const DB_NAME = 'jmdict';
const DB_VERSION = 1; // todo
const DB_OBJECT_STORE = 'words';
const DB_INDEX = 'forms';

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
        case RuntimeEvent.LookupWord: {
            const dbRequest = self.indexedDB.open(DB_NAME, DB_VERSION);
            dbRequest.onsuccess = (event: any) => {
                if (!event.target?.result) {
                    console.error("failed to get a handle to the word database");
                    sendResponse(undefined);
                    return;
                }
                const db = event.target.result as IDBDatabase;
                const message = request.data;
                const wordRequest = db.transaction(DB_OBJECT_STORE)
                    .objectStore(DB_OBJECT_STORE)
                    .index(DB_INDEX)
                    .get(message.baseForm);
                wordRequest.onerror = (_event: any) => {
                    console.error("failed to lookup word", message.baseForm);
                    sendResponse(undefined);
                };
                wordRequest.onsuccess = (_event: any) => {
                    sendResponse(wordRequest.result);
                };
            };
            dbRequest.onerror = (event: any) => {
                console.error("failed to get a handle to the word database");
                sendResponse(undefined);
            };
            break;
        }
        default:
            console.warn("unrecognized request", request);
    }
    return true; // result will be returned async
}
);

function forms(word: JMdictWord) {
    const kanjiForms = word.kanji.map((kanji) => kanji.text);
    const kanaForms = word.kana.map((kana) => kana.text);
    return [...kanjiForms, ...kanaForms];
}

chrome.runtime.onInstalled.addListener((_details) => {
    // initialize the dictionary
    const request = self.indexedDB.open(DB_NAME, DB_VERSION);
    request.onblocked = (event: any) => {
        const db = event.target.result as IDBDatabase;
        db.close();
    };
    request.onerror = (event: any) => {
        console.error(`Database error: ${event.target?.errorCode}`);
    };
    request.onupgradeneeded = (event: any) => {
        if (!event.target) {
            console.error('Unable to get handle to database');
            return;
        }
        const db = event.target.result as IDBDatabase;
        const wordsStore = db.createObjectStore(DB_OBJECT_STORE, { keyPath: "id" });
        wordsStore.createIndex(DB_INDEX, DB_INDEX, { unique: false, multiEntry: true });
        wordsStore.transaction.oncomplete = async () => {
            try {
                // def not efficient but let's just get it working for now
                if (!db) {
                    console.error('Unable to get handle to database');
                    return;
                }
                const dictUrl = chrome.runtime.getURL('jmdict-simplified/jmdict-eng.json');
                const response = await fetch(dictUrl);
                const jmdict = await response.json() as JMdict;
                const store = db.transaction("words", "readwrite").objectStore("words");
                for (const [_key, value] of Object.entries(jmdict.words)) {
                    const entry = {
                        ...value,
                        forms: forms(value)
                    };
                    store.add(entry);
                }
            } catch (error) {
                console.error('Error encountered while updating word database');
            }
        };
    };
});