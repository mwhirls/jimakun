import { JMdict, JMdictWord } from "@scriptin/jmdict-simplified-types";
import { LookupWordMessage, Operation } from "../util/events";
import { DBStoreUpgrade, IDBUpgradeContext, IDBWrapper, DBStoreUpgradeContext, DBStoreOperation } from "./database";

const INDEX = {
    name: "forms",
    unique: false,
    multiEntry: true,
};
const OBJECT_STORE = {
    name: "jmdict",
    keyPath: "id",
    indexes: [INDEX]
};
const DATA_URL = 'jmdict-simplified/jmdict-eng.json'

function forms(word: JMdictWord) {
    const kanjiForms = word.kanji.map((kanji) => kanji.text);
    const kanaForms = word.kana.map((kana) => kana.text);
    return [...kanjiForms, ...kanaForms];
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

export class JMDictStore {
    readonly db: IDBWrapper;

    private constructor(db: IDBWrapper) {
        this.db = db;
    }

    static async open(name: string, version: number, onDBUpgrade: (db: IDBUpgradeContext) => Promise<IDBWrapper>) {
        const db = await IDBWrapper.open(name, version, onDBUpgrade);
        return new JMDictStore(db);
    }

    static async openWith(db: IDBWrapper) {
        return new JMDictStore(db);
    }

    async populate(onProgressTick: (operation: DBStoreOperation, value: number, max: number) => void) {
        const dictUrl = chrome.runtime.getURL(DATA_URL);
        const response = await fetch(dictUrl);
        const jmdict = await response.json() as JMdict;
        const count = await this.db.countRecords(OBJECT_STORE);
        if (!this.db.upgraded && count === jmdict.words.length) {
            return;
        }
        const entries = Object.entries(jmdict.words).map((entry: [string, JMdictWord], index, arr) => {
            onProgressTick(DBStoreOperation.LoadData, index + 1, arr.length)
            return {
                ...entry[1],
                forms: forms(entry[1]),
            };
        });
        this.db.putAll(OBJECT_STORE, entries, onProgressTick);
    }

    async lookupWord(lookup: LookupWordMessage): Promise<JMdictWord | undefined> {
        return this.db.getFromIndex<JMdictWord>(OBJECT_STORE, INDEX, lookup.baseForm);
    }

    async lookupBestMatch(lookup: LookupWordMessage): Promise<JMdictWord | undefined> {
        const matches = await this.db.openCursorOnIndex<JMdictWord>(OBJECT_STORE, INDEX, lookup.baseForm);
        return findBestMatch(matches, lookup);
    }
}

export class JMDictStoreUpgrade implements DBStoreUpgrade {
    readonly db: DBStoreUpgradeContext;

    constructor(db: DBStoreUpgradeContext) {
        this.db = db;
    }

    async apply() {
        this.db.create([OBJECT_STORE]);
    }
}