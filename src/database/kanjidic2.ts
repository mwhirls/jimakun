import { Kanjidic2, Kanjidic2Character } from "@scriptin/jmdict-simplified-types";
import { LookupKanjiMessage, Operation } from "../util/events";
import { IDBWrapper, DBStoreUpgrade, IDBUpgradeContext, DBStoreUpgradeContext, DBStoreOperation } from "./database";
import { awaitSequential } from "../util/async";

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

export class KanjiDic2Store {
    readonly db: IDBWrapper;

    private constructor(db: IDBWrapper) {
        this.db = db;
    }

    static async open(name: string, version: number, onDBUpgrade: (db: IDBUpgradeContext) => Promise<IDBWrapper>) {
        const db = await IDBWrapper.open(name, version, onDBUpgrade);
        return new KanjiDic2Store(db);
    }

    static async openWith(db: IDBWrapper) {
        return new KanjiDic2Store(db);
    }

    async lookup(lookup: LookupKanjiMessage): Promise<Kanjidic2Character[]> {
        const results = lookup.kanji.map(query => this.db.getFromIndex<Kanjidic2Character>(OBJECT_STORE, INDEX, query));
        const kanji = await Promise.all(results);
        return kanji.flatMap(v => v ? [v] : []); // filter undefineds
    }

    async populate(onProgressTick: (operation: DBStoreOperation, value: number, max: number) => Promise<void>) {
        const dataUrl = chrome.runtime.getURL(DATA_URL);
        const response = await fetch(dataUrl);
        const kanjidic2 = await response.json() as Kanjidic2;
        const checkpoints: number[] = [0, 0.25, 0.5, 0.75, 0.9, 1.0].map(pct => Math.floor((kanjidic2.characters.length - 1) * pct));
        const promises = kanjidic2.characters.map(async (entry, index, arr) => {
            if (checkpoints.includes(index)) {
                await onProgressTick(DBStoreOperation.LoadData, index + 1, arr.length);
            }
            return {
                ...entry,
                id: index,
            };
        });
        const entries = await awaitSequential(promises);
        await this.db.putAll(OBJECT_STORE, entries, onProgressTick, checkpoints);
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