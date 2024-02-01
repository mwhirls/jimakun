import { JMdict, JMdictKana, JMdictKanji, JMdictSense, JMdictWord } from "@scriptin/jmdict-simplified-types";
import { LookupWordsMessage } from "../common/events";
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

type WordLookup = {
    surfaceForm: string;
    baseForm: string;
    katakana: string;
    hiragana: string;
};

function forms(word: JMdictWord) {
    const kanjiForms = word.kanji.map((kanji) => kanji.text);
    const kanaForms = word.kana.map((kana) => kana.text);
    return [...kanjiForms, ...kanaForms];
}

function isKanaOnly(lookup: WordLookup) {
    return lookup.katakana === lookup.surfaceForm ||
        lookup.hiragana === lookup.surfaceForm;
}

function gradeBaseForm(match: JMdictWord, lookup: WordLookup): number {
    if (isKanaOnly(lookup)) {
        return match.kanji.length ? -1 : 1;
    }
    const baseForm = match.kanji.find((x) => x.text === lookup.baseForm);
    return baseForm ? 1 : 0;
}

function gradeSurfaceForm(match: JMdictWord, lookup: WordLookup): number {
    if (isKanaOnly(lookup)) {
        const surfaceForm = match.kana.find((x) => x.text === lookup.surfaceForm);
        return surfaceForm ? 2 : 0;
    }
    const surfaceForm = match.kanji.find((x) => x.text === lookup.surfaceForm);
    return surfaceForm ? 2 : 0;
}

function gradeReading(match: JMdictWord, lookup: WordLookup): number {
    const reading = match.kana.find((x) => x.text === lookup.katakana || x.text === lookup.hiragana);
    return reading ? 1 : 0;
}

function gradePartOfSpeech(_match: JMdictWord, _lookup: WordLookup): number {
    return 0; // todo
}

function gradeMatch(match: JMdictWord, lookup: WordLookup): number {
    const baseForm = gradeBaseForm(match, lookup);
    const surfaceForm = gradeSurfaceForm(match, lookup);
    const reading = gradeReading(match, lookup);
    const partOfSpeech = gradePartOfSpeech(match, lookup);
    const sum = baseForm + surfaceForm + reading + partOfSpeech;
    return sum;
}

function findBestMatch(matches: JMdictWord[], lookup: WordLookup): JMdictWord | undefined {
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

    static async open(name: string, version: number, onDBUpgrade: (db: IDBUpgradeContext) => Promise<IDBWrapper>, onDBVersionChanged: () => void) {
        const db = await IDBWrapper.open(name, version, onDBUpgrade, onDBVersionChanged);
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

    async lookupBestMatches(lookup: LookupWordsMessage) {
        const results = lookup.words.map(async (word) => {
            const queries = [
                word.surfaceForm,
                word.baseForm,
            ];
            const results = queries.map(query => this.db.openCursorOnIndex<JMdictWord>(OBJECT_STORE, INDEX, query));
            const matches = (await Promise.all(results)).flat();
            return findBestMatch(matches, word);
        });
        return Promise.all(results);
    }
}

export class JMDictStoreUpgrade implements DBStoreUpgrade {
    readonly db: DBStoreUpgradeContext;

    constructor(db: DBStoreUpgradeContext) {
        this.db = db;
    }

    apply() {
        if (!this.db.exists(OBJECT_STORE)) {
            this.db.create([OBJECT_STORE]);
        }
    }
}