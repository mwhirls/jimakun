import { Kanjidic2, Kanjidic2Character } from "@scriptin/jmdict-simplified-types";
import { LookupKanjiMessage } from "../util/events";
import { IDBWrapper, DBStoreUpgrade, IDBUpgradeContext, DBStoreUpgradeContext, DBOperation, IDBObjectStoreWrapper, ProgressUpdateCallback } from "./database";
import { awaitSequential } from "../util/async";
import { JSONDataProvider } from "./data-provider";

const INDEX = {
    name: "literal",
    unique: false,
    multiEntry: false,
};
const OBJECT_STORE = {
    name: "kanji-dic2",
    keyPath: "id",
    indexes: [INDEX]
}
const DATA_URL = 'jmdict-simplified/kanjidic2-en.json'

export class KanjiDic2Store implements IDBObjectStoreWrapper {
    readonly db: IDBWrapper;

    constructor(db: IDBWrapper) {
        this.db = db;
    }

    static async open(name: string, version: number, onDBUpgrade: (db: IDBUpgradeContext) => Promise<IDBWrapper>) {
        const db = await IDBWrapper.open(name, version, onDBUpgrade);
        return new KanjiDic2Store(db);
    }

    async lookup(lookup: LookupKanjiMessage): Promise<Kanjidic2Character[]> {
        const results = lookup.kanji.map(query => this.db.getFromIndex<Kanjidic2Character>(OBJECT_STORE, INDEX, query));
        const kanji = await Promise.all(results);
        return kanji.flatMap(v => v ? [v] : []); // filter undefineds
    }

    name(): string {
        return OBJECT_STORE.name;
    }

    async populate(onProgressUpdate: ProgressUpdateCallback) {
        const data = await JSONDataProvider.fetch<Kanjidic2, Kanjidic2Character, Kanjidic2Character>(DATA_URL, onProgressUpdate);
        const readEntries = (data: Kanjidic2) => data.characters;
        const parseEntry = (entry: Kanjidic2Character) => entry;
        const entries = await data.parse(readEntries, parseEntry, onProgressUpdate);
        await this.db.putAll(OBJECT_STORE, entries, onProgressUpdate);
    }
}

export class KanjiDic2StoreUpgrade implements DBStoreUpgrade {
    readonly db: DBStoreUpgradeContext;

    constructor(db: DBStoreUpgradeContext) {
        this.db = db;
    }

    async apply() {
        await this.db.create([OBJECT_STORE]);
    }
}