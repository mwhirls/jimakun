import { MovieChangedMessage, RuntimeEvent, RuntimeMessage, SeekCueMessage, SeekDirection } from "./util/events";
import type { JMdict, JMdictWord } from "@scriptin/jmdict-simplified-types";

const NEXT_CUE_ID = 'next-cue';
const PREV_CUE_ID = 'prev-cue';
const REPEAT_CUE_ID = 'repeat-cue';
const TOGGLE_SUBS_ID = 'toggle-subs';
const DB_NAME = 'jmdict';
const DB_VERSION = 1; // todo

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
        if (command === NEXT_CUE_ID) {
            const data: SeekCueMessage = { direction: SeekDirection.Next };
            const message: RuntimeMessage = { event: RuntimeEvent.SeekCue, data: data };
            chrome.tabs.sendMessage(tabId, message);
        }
        else if (command === REPEAT_CUE_ID) {
            const data: SeekCueMessage = { direction: SeekDirection.Repeat };
            const message: RuntimeMessage = { event: RuntimeEvent.SeekCue, data: data };
            chrome.tabs.sendMessage(tabId, message);
        }
        else if (command === PREV_CUE_ID) {
            const data: SeekCueMessage = { direction: SeekDirection.Previous };
            const message: RuntimeMessage = { event: RuntimeEvent.SeekCue, data: data };
            chrome.tabs.sendMessage(tabId, message);
        }
        else if (command === TOGGLE_SUBS_ID) {
            const message: RuntimeMessage = { event: RuntimeEvent.ToggleSubs, data: null };
            chrome.tabs.sendMessage(tabId, message);
        }
    });
});

function forms(word: JMdictWord) {
    const kanaForms = word.kana.map((kana) => kana.text);
    const kanjiForms = word.kanji.map((kanji) => kanji.text);
    return [...kanaForms, ...kanjiForms];
}

chrome.runtime.onInstalled.addListener((details) => {
    // initialize the dictionary
    const request = self.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event: any) => {
        console.log(`Successfully opened database ${DB_NAME}`);
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
        const wordsStore = db.createObjectStore("words", { keyPath: "id" });
        wordsStore.createIndex("forms", "forms", { unique: false, multiEntry: true });
        wordsStore.transaction.oncomplete = async (event) => {
            try {
                // def not efficient but let's just get it working for now
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