import { RuntimeMessage } from "../common/events";
import { SessionStorageObject } from "../storage/session-storage";

const MOVIE_KEY = 'lastMovieId';

export async function sendMessageToAll(message: RuntimeMessage) {
    try {
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
            if (tab.id) {
                chrome.tabs.sendMessage(tab.id, message, () => {
                    console.warn(`message not received by tab ${tab.id}`, chrome.runtime.lastError);
                });
            }
        }
    } catch (e) {
        console.error('failed to query tabs', e);
    }
}

export async function sendMessageToActive(message: RuntimeMessage) {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        for (const tab of tabs) {
            if (tab.id) {
                chrome.tabs.sendMessage(tab.id, message, () => {
                    console.warn(`message not received by tab ${tab.id}`, chrome.runtime.lastError);
                });
            }
        }
    } catch (e) {
        console.error('failed to query tabs', e);
    }
}

export function sendMessageTo(tabId: number, message: RuntimeMessage) {
    chrome.tabs.sendMessage(tabId, message, () => {
        console.warn(`message not received by tab ${tabId}`, chrome.runtime.lastError);
    });
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

function onTabsUpdated(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
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
}

export function registerListeners() {
    chrome.tabs.onUpdated.addListener(onTabsUpdated);
}