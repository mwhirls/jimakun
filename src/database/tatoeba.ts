import { awaitSequential } from "../util/async";
import { LookupSentencesMessage, LookupSentencesResult, Operation } from "../util/events";
import { CorpusSentence } from "../util/tanaka-corpus-types";
import { IDBWrapper, DBStoreUpgrade, IDBUpgradeContext, DBStoreUpgradeContext, DBStoreOperation } from "./database";

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

export class TatoebaStore {
    readonly db: IDBWrapper;

    private constructor(db: IDBWrapper) {
        this.db = db;
    }

    static async open(name: string, version: number, onDBUpgrade: (db: IDBUpgradeContext) => Promise<IDBWrapper>) {
        const db = await IDBWrapper.open(name, version, onDBUpgrade);
        return new TatoebaStore(db);
    }

    static async openWith(db: IDBWrapper) {
        return new TatoebaStore(db);
    }

    async lookup(lookup: LookupSentencesMessage): Promise<LookupSentencesResult> {
        const count = await this.db.countQueryResults(OBJECT_STORE, INDEX, lookup.searchTerm);
        const pages = Math.ceil(count / lookup.perPage);
        const pagination = { page: lookup.page, perPage: lookup.perPage };
        const sentences = await this.db.openCursorOnIndex<CorpusSentence>(OBJECT_STORE, INDEX, lookup.searchTerm, pagination);
        return { pages, sentences };
    }

    async populate(onProgressTick: (operation: DBStoreOperation, value: number, max: number) => Promise<void>) {
        const dictUrl = chrome.runtime.getURL(DATA_URL);
        const response = await fetch(dictUrl);
        const sentences = await response.json() as CorpusSentence[];
        const checkpoints: number[] = [0, 0.25, 0.5, 0.75, 0.9, 1.0].map(pct => Math.floor((sentences.length - 1) * pct));
        const promises = sentences.map(async (entry, index, arr) => {
            if (checkpoints.includes(index)) {
                onProgressTick(DBStoreOperation.LoadData, index + 1, arr.length);
            }
            const keywords: string[] = entry.words.flatMap(word => {
                return [word.headword, ...word.reading ?? [], ...word.surfaceForm ?? []]
            });
            return {
                ...entry,
                keywords,
            };
        });
        const entries = await awaitSequential(promises);
        return this.db.putAll(OBJECT_STORE, entries, onProgressTick, checkpoints);
    }
}

export class TatoebaStoreUpgrade implements DBStoreUpgrade {
    readonly db: DBStoreUpgradeContext;

    constructor(db: DBStoreUpgradeContext) {
        this.db = db;
    }

    async apply() {
        this.db.create([OBJECT_STORE]);
    }
}