import { initializeDictionary, lookupBestMatch, lookupWord } from "./dictionary";
import { MovieChangedMessage, RuntimeEvent, RuntimeMessage, SeekCueMessage, SeekDirection } from "./util/events";

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
            lookupBestMatch(message).then(word => sendResponse(word));
            break;
        }
        default:
            console.warn("unrecognized request", request);
    }
    return true; // result will be returned async
}
);

chrome.runtime.onInstalled.addListener((_details) => {
    initializeDictionary(5);
});