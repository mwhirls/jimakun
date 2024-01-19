import { RuntimeMessage } from "./util/events";

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