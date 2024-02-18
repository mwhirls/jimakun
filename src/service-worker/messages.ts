import { LookupWordsMessage, LookupKanjiMessage, CountSentencesMessage, LookupSentencesMessage, PlayAudioMessage, RuntimeEvent, RuntimeMessage } from "../common/events";
import { openJMDict, openKanjiDic2, openTatoeba, purgeReimport } from "./database";

type ResponseHandler = (response?: unknown) => void;

async function lookupWords(data: unknown, sendResponse: ResponseHandler) {
    try {
        const message = LookupWordsMessage.parse(data);
        const dict = await openJMDict();
        const words = await dict.lookupBestMatches(message);
        sendResponse(words);
    } catch (e) {
        sendResponse(undefined); // TODO: better error handling
    }
}

async function lookupKanji(data: unknown, sendResponse: ResponseHandler) {
    try {
        const message = LookupKanjiMessage.parse(data);
        const dict = await openKanjiDic2();
        const kanji = await dict.lookup(message);
        sendResponse(kanji);
    } catch (e) {
        sendResponse(undefined); // TODO: better error handling
    }
}

async function countSentences(data: unknown, sendResponse: ResponseHandler) {
    try {
        const message = CountSentencesMessage.parse(data);
        const store = await openTatoeba();
        const count = await store.count(message);
        sendResponse(count);
    } catch (e) {
        sendResponse(0); // TODO: better error handling
    }
}

async function lookupSentences(data: unknown, sendResponse: ResponseHandler) {
    try {
        const message = LookupSentencesMessage.parse(data);
        const store = await openTatoeba();
        const sentences = await store.lookup(message);
        sendResponse(sentences);
    } catch (e) {
        sendResponse(undefined); // TODO: better error handling
    }
}

function openOptionsPage() {
    chrome.runtime.openOptionsPage(() => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
            console.error(lastError);
        }
    });
}

function playAudio(data: unknown) {
    try {
        const message = PlayAudioMessage.parse(data);
        if (!message.utterance) {
            return;
        }
        chrome.tts.speak(message.utterance, { lang: 'ja' });
    } catch (e) {
        console.error(e);
    }
}

async function purgeDictionaries(sendResponse: (response?: unknown) => void) {
    try {
        await purgeReimport();
        sendResponse(true);
    } catch (e) {
        sendResponse(false);
    }
}

function validate(request: unknown) {
    try {
        const message = RuntimeMessage.parse(request);
        return message;
    } catch (e) {
        console.error('ill-formed message sent to service worker: ', e)
        return null;
    }
}

function onMessage(request: unknown, _sender: chrome.runtime.MessageSender, sendResponse: ResponseHandler) {
    const message = validate(request);
    if (!message) {
        sendResponse(undefined); // todo: better error reporting sent to user?
        return false;
    }
    switch (message.event) {
        case RuntimeEvent.enum.LookupWords:
            lookupWords(message.data, sendResponse);
            break;
        case RuntimeEvent.enum.LookupKanji:
            lookupKanji(message.data, sendResponse);
            break;
        case RuntimeEvent.enum.CountSentences:
            countSentences(message.data, sendResponse);
            break;
        case RuntimeEvent.enum.LookupSentences:
            lookupSentences(message.data, sendResponse);
            break;
        case RuntimeEvent.enum.OpenOptions:
            openOptionsPage();
            return false;
        case RuntimeEvent.enum.PlayAudio:
            playAudio(message.data);
            return false;
        case RuntimeEvent.enum.PurgeDictionaries:
            purgeDictionaries(sendResponse);
            break;
        default:
            console.warn("unrecognized request", request);
    }
    return true; // result will be returned async
}

export function registerListeners() {
    chrome.runtime.onMessage.addListener(onMessage);
}