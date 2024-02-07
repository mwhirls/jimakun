import { LookupWordsMessage, LookupKanjiMessage, CountSentencesMessage, LookupSentencesMessage, PlayAudioMessage, RuntimeEvent, RuntimeMessage } from "../common/events";
import { openJMDict, openKanjiDic2, openTatoeba, purgeReimport } from "./database";

async function lookupWords(message: LookupWordsMessage, sendResponse: (response?: unknown) => void) {
    try {
        const dict = await openJMDict();
        const words = await dict.lookupBestMatches(message);
        sendResponse(words);
    } catch (e) {
        sendResponse(undefined); // TODO: better error handling
    }
}

async function lookupKanji(message: LookupKanjiMessage, sendResponse: (response?: unknown) => void) {
    try {
        const dict = await openKanjiDic2();
        const kanji = await dict.lookup(message);
        sendResponse(kanji);
    } catch (e) {
        sendResponse(undefined); // TODO: better error handling
    }
}

async function countSentences(message: CountSentencesMessage, sendResponse: (response?: unknown) => void) {
    try {
        const store = await openTatoeba();
        const count = await store.count(message);
        sendResponse(count);
    } catch (e) {
        sendResponse(0); // TODO: better error handling
    }
}

async function lookupSentences(message: LookupSentencesMessage, sendResponse: (response?: unknown) => void) {
    try {
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

function playAudio(message: PlayAudioMessage) {
    if (!message.utterance) {
        return;
    }
    chrome.tts.speak(message.utterance, { lang: 'ja' });
}

async function purgeDictionaries(sendResponse: (response?: unknown) => void) {
    try {
        await purgeReimport();
        sendResponse(true);
    } catch (e) {
        sendResponse(false);
    }
}

function onMessage(request: RuntimeMessage, _sender: chrome.runtime.MessageSender, sendResponse: (response?: unknown) => void) {
    const message = request.data; // todo: validate
    switch (request.event) {
        case RuntimeEvent.enum.LookupWords:
            lookupWords(message as LookupWordsMessage, sendResponse);
            break;
        case RuntimeEvent.enum.LookupKanji:
            lookupKanji(message as LookupKanjiMessage, sendResponse);
            break;
        case RuntimeEvent.enum.CountSentences:
            countSentences(message as CountSentencesMessage, sendResponse);
            break;
        case RuntimeEvent.enum.LookupSentences:
            lookupSentences(message as LookupSentencesMessage, sendResponse);
            break;
        case RuntimeEvent.enum.OpenOptions:
            openOptionsPage();
            return false;
        case RuntimeEvent.enum.PlayAudio:
            playAudio(message as PlayAudioMessage);
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