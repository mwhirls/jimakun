import { JMdict, JMdictKana, JMdictKanji, JMdictSense, JMdictWord } from "@scriptin/jmdict-simplified-types";
import { LookupWordMessage } from "../util/events";
import { DBStoreUpgrade, IDBUpgradeContext, IDBWrapper, DBStoreUpgradeContext, ProgressUpdateCallback, IDBObjectStoreWrapper } from "./database";
import { JSONDataProvider } from "./data-provider";

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

interface JMDictEntry {
    id: string;
    kanji: JMdictKanji[];
    kana: JMdictKana[];
    sense: JMdictSense[];
    forms: string[];
}

export class JMDictStore implements IDBObjectStoreWrapper {
    readonly db: IDBWrapper;

    constructor(db: IDBWrapper) {
        this.db = db;
    }

    static async open(name: string, version: number, onDBUpgrade: (db: IDBUpgradeContext) => Promise<IDBWrapper>) {
        const db = await IDBWrapper.open(name, version, onDBUpgrade);
        return new JMDictStore(db);
    }

    name(): string {
        return OBJECT_STORE.name;
    }

    async populate(onProgressUpdate: ProgressUpdateCallback) {
        const data = await JSONDataProvider.fetch<JMdict, JMdictWord, JMDictEntry>(DATA_URL, onProgressUpdate);
        const readEntries = (data: JMdict) => data.words;
        const count = await this.db.countRecords(OBJECT_STORE);
        if (!this.db.upgraded && count === data.count(readEntries)) {
            return;
        }
        const parseEntry = ((entry: JMdictWord) => {
            return {
                ...entry,
                forms: forms(entry),
            };
        })
        const entries = await data.parse(readEntries, parseEntry, onProgressUpdate);
        await this.db.putAll(OBJECT_STORE, entries, onProgressUpdate);
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

    apply() {
        this.db.create([OBJECT_STORE]);
    }
}