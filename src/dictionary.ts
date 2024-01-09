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
    const entries = Object.entries(jmdict.words).map((entry: [string, JMdictWord]) => {
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

function gradeBaseForm(match: JMdictWord, lookup: LookupWordMessage): number {
    const kanaOnly = lookup.katakana === lookup.surfaceForm ||
        lookup.hiragana === lookup.surfaceForm;
    if (kanaOnly) {
        return match.kanji.length ? -1 : 1;
    }
    const baseForm = match.kanji.find((x) => x.text === lookup.baseForm);
    return baseForm ? 1 : 0;
}

function gradeReading(match: JMdictWord, lookup: LookupWordMessage): number {
    const reading = match.kana.find((x) => x.text === lookup.katakana || x.text === lookup.hiragana);
    return reading ? 1 : 0;
}

function gradePartOfSpeech(_match: JMdictWord, _lookup: LookupWordMessage): number {
    return 0; // todo
}

function gradeMatch(match: JMdictWord, lookup: LookupWordMessage): number {
    const baseForm = gradeBaseForm(match, lookup);
    const reading = gradeReading(match, lookup);
    const partOfSpeech = gradePartOfSpeech(match, lookup);
    const sum = baseForm + reading + partOfSpeech;
    return sum;
}

function findBestMatch(matches: JMdictWord[], lookup: LookupWordMessage): JMdictWord | undefined {
    if (!matches.length) {
        return undefined;
    }
    let bestScore = Number.MIN_SAFE_INTEGER;
    let bestMatch = undefined;
    for (const match of matches) {
        const grade = gradeMatch(match, lookup);
        if (grade > bestScore) {
            bestMatch = match;
            bestScore = grade;
        }
    }
    return bestMatch;
}

export async function initializeDictionary(maxAttempts?: number) {
    return tryOpen(0, maxAttempts ?? 5);
}

export async function lookupWord(lookup: LookupWordMessage): Promise<JMdictWord | undefined> {
    const db = await IDBWrapper.open(DB_NAME, DB_VERSION, onUpgrade);
    return db.getFromIndex<JMdictWord>(DB_OBJECT_STORE, DB_INDEX, lookup.baseForm);
}

export async function lookupBestMatch(lookup: LookupWordMessage): Promise<JMdictWord | undefined> {
    const db = await IDBWrapper.open(DB_NAME, DB_VERSION, onUpgrade);
    const matches = await db.openCursorOnIndex<JMdictWord>(DB_OBJECT_STORE, DB_INDEX, lookup.baseForm);
    return findBestMatch(matches, lookup);
}
