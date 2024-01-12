import { TanakaCorpus, CorpusSentence } from "../util/tanaka-corpus-types";
import { IDBWrapper, DBStoreUpgrade, IDBUpgradeContext, DBStore } from "./database";

const INDEX = {
    name: "keywords",
    unique: false,
    multiEntry: true,
};
const OBJECT_STORE = {
    name: "tanaka-corpus",
    keyPath: "id",
    indexes: [INDEX]
}
const DATA_URL = 'tanaka-corpus-json/jpn-eng-examples.json';

export class ExamplesStore {
    readonly db: IDBWrapper;

    private constructor(db: IDBWrapper) {
        this.db = db;
    }

    static async open(name: string, version: number, onDBUpgrade: (db: IDBUpgradeContext) => Promise<IDBWrapper>) {
        const db = await IDBWrapper.open(name, version, onDBUpgrade);
        return new ExamplesStore(db);
    }

    // todo: look up example sentences
}

export class ExamplesStoreUpgrade implements DBStoreUpgrade {
    readonly db: IDBUpgradeContext;

    constructor(db: IDBUpgradeContext) {
        this.db = db;
    }

    objectStore(): DBStore {
        return OBJECT_STORE;
    }

    async apply() {
        const dictUrl = chrome.runtime.getURL(DATA_URL);
        const response = await fetch(dictUrl);
        const sentences = await response.json() as CorpusSentence[];
        const entries = sentences.map(entry => {
            const keywords: string[] = []; // todo: populate keywords for indexing
            return {
                ...entry,
                keywords,
            };
        });
        this.db.insert(OBJECT_STORE, entries);
    }
}