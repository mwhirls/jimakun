import { DBErrorType, DatabaseError, IDBUpgradeContext, IDBWrapper } from "./database";
import { LookupWordMessage } from "./util/events";
import type { JMdict, JMdictWord } from "@scriptin/jmdict-simplified-types";

const DB_NAME = 'jmdict';
const DB_VERSION = 1; // todo
const DB_OBJECT_STORE = 'words';
const DB_INDEX = 'forms';
const DICTIONARY_DATA = 'jmdict-simplified/jmdict-eng.json';
const OBJECT_STORE_KEY = 'id';

function forms(word: JMdictWord) {
    const kanjiForms = word.kanji.map((kanji) => kanji.text);
    const kanaForms = word.kana.map((kana) => kana.text);
    return [...kanjiForms, ...kanaForms];
}

async function onUpgrade(db: IDBUpgradeContext) {
    await db.declare([
        {
            name: DB_OBJECT_STORE,
            keyPath: OBJECT_STORE_KEY,
            indexes: [
                {
                    name: DB_INDEX,
                    unique: false,
                    multiEntry: true,
                }
            ]
        }
    ]);
    const dictUrl = chrome.runtime.getURL(DICTIONARY_DATA);
    const response = await fetch(dictUrl);
    const jmdict = await response.json() as JMdict;
    const entries = Object.entries(jmdict.words).map((entry: [string, any]) => {
        return {
            ...entry[1],
            forms: forms(entry[1])
        };
    });
    db.insert(DB_OBJECT_STORE, entries);
}

async function tryOpen(attempt: number, maxAttempts: number) {
    if (attempt >= maxAttempts) {
        console.error(`unable to open database after ${maxAttempts} attemps; aborting`);
        return;
    }
    try {
        await IDBWrapper.open(DB_NAME, DB_VERSION, onUpgrade);
    } catch (e: any) {
        if (e instanceof DatabaseError) {
            switch (e.type) {
                case DBErrorType.Blocked:
                    // re-attempt
                    console.warn('database was blocked; attempting to reopen...');
                    tryOpen(++attempt, maxAttempts);
                    break;
                case DBErrorType.Unknown:
                    console.warn('error when opening database', e.type, e.message, e.stack);
                    break;
            }
        } else {
            console.warn('unknown error when initializing database', e.message, e.stack);
        }
    }
}

export async function initializeDictionary(maxAttempts?: number) {
    return tryOpen(0, maxAttempts ?? 5);
}

export async function lookupWord(lookup: LookupWordMessage): Promise<JMdictWord | undefined> {
    const db = await IDBWrapper.open(DB_NAME, DB_VERSION, onUpgrade);
    return db.get<JMdictWord>(DB_OBJECT_STORE, DB_INDEX, lookup.baseForm);
}
