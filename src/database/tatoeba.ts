import { LookupSentencesMessage, LookupSentencesResult } from "../util/events";
import { TatoebaSentence, TatoebaWord } from "../util/tatoeba-types";
import { JSONDataProvider } from "./data-provider";
import { IDBWrapper, DBStoreUpgrade, IDBUpgradeContext, DBStoreUpgradeContext, ProgressUpdateCallback, IDBObjectStoreWrapper } from "./database";

const INDEX = {
    name: "keywords",
    unique: false,
    multiEntry: true,
};
const OBJECT_STORE = {
    name: "tatoeba",
    keyPath: "id",
    indexes: [INDEX]
}
const DATA_URL = 'tanaka-corpus-json/jpn-eng-examples.json';

interface TatoebaEntry {
    keywords: string[];
    id: string;
    text: string;
    translation: string;
    words: TatoebaWord[];
}

export class TatoebaStore implements IDBObjectStoreWrapper {
    readonly db: IDBWrapper;

    constructor(db: IDBWrapper) {
        this.db = db;
    }

    static async open(name: string, version: number, onDBUpgrade: (db: IDBUpgradeContext) => Promise<IDBWrapper>) {
        const db = await IDBWrapper.open(name, version, onDBUpgrade);
        return new TatoebaStore(db);
    }

    async lookup(lookup: LookupSentencesMessage): Promise<LookupSentencesResult> {
        const count = await this.db.countQueryResults(OBJECT_STORE, INDEX, lookup.searchTerm);
        const pages = Math.ceil(count / lookup.perPage);
        const pagination = { page: lookup.page, perPage: lookup.perPage };
        const sentences = await this.db.openCursorOnIndex<TatoebaSentence>(OBJECT_STORE, INDEX, lookup.searchTerm, pagination);
        return { pages, sentences };
    }

    name(): string {
        return OBJECT_STORE.name;
    }

    async populate(onProgressUpdate: ProgressUpdateCallback) {
        const data = await JSONDataProvider.fetch<TatoebaSentence[], TatoebaSentence, TatoebaEntry>(DATA_URL, onProgressUpdate);
        const readEntries = (data: TatoebaSentence[]) => data;
        const parseEntry = ((entry: TatoebaSentence) => {
            const keywords: string[] = entry.words.flatMap(word => {
                return [word.headword, ...word.reading ?? [], ...word.surfaceForm ?? []]
            });
            return {
                ...entry,
                keywords,
            };
        })
        const entries = await data.parse(readEntries, parseEntry, onProgressUpdate);
        await this.db.putAll(OBJECT_STORE, entries, onProgressUpdate);
    }
}

export class TatoebaStoreUpgrade implements DBStoreUpgrade {
    readonly db: DBStoreUpgradeContext;

    constructor(db: DBStoreUpgradeContext) {
        this.db = db;
    }

    apply() {
        this.db.create([OBJECT_STORE]);
    }
}