import { IDBUpgradeContext, IDBWrapper } from "./database/database";
import { Dictionary, DictionaryUpgrade } from "./database/dictionary";
import { ExamplesStore, ExamplesStoreUpgrade } from "./database/examples";
import { KanjiDic2Store, KanjiDic2StoreUpgrade } from "./database/kanji";
import { MovieChangedMessage, RuntimeEvent, RuntimeMessage, SeekCueMessage, SeekDirection } from "./util/events";

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
        case RuntimeEvent.LookupWord: {
            const message = request.data;
            Dictionary.open(DB_NAME, DB_VERSION, onDBUpgrade)
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
            ExamplesStore.open(DB_NAME, DB_VERSION, onDBUpgrade)
                .then(store => {
                    store.lookup(message)
                        .then(sentences => sendResponse(sentences));
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
    const upgrades = [
        new DictionaryUpgrade(db),
        new ExamplesStoreUpgrade(db),
        new KanjiDic2StoreUpgrade(db),
    ];
    const result = upgrades.map(x => x.apply());
    await Promise.all(result);
    return db.wrapper;
}

chrome.runtime.onStartup.addListener(function () {
    IDBWrapper.open(DB_NAME, DB_VERSION, onDBUpgrade, DB_OPEN_MAX_ATTEMPTS);
    Dictionary.open(DB_NAME, DB_VERSION, onDBUpgrade).then(x => x.populate());
    KanjiDic2Store.open(DB_NAME, DB_VERSION, onDBUpgrade).then(x => x.populate());
    ExamplesStore.open(DB_NAME, DB_VERSION, onDBUpgrade).then(x => x.populate());
});

chrome.runtime.onInstalled.addListener(() => {
    IDBWrapper.open(DB_NAME, DB_VERSION, onDBUpgrade, DB_OPEN_MAX_ATTEMPTS);
    Dictionary.open(DB_NAME, DB_VERSION, onDBUpgrade).then(x => x.populate());
    KanjiDic2Store.open(DB_NAME, DB_VERSION, onDBUpgrade).then(x => x.populate());
    ExamplesStore.open(DB_NAME, DB_VERSION, onDBUpgrade).then(x => x.populate());
});