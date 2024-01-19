import { awaitSequential } from "../util/async";
import { ProgressUpdateCallback, DBOperation } from "./database";

type ReadEntriesCallback<Data, Entry> = (data: Data) => Entry[];
type ParseEntryCallback<Original, Parsed> = (entry: Original) => Parsed;

export class JSONDataProvider<Data, Entry, Parsed> {
    data: Data;

    constructor(data: Data) {
        this.data = data;
    }

    static async fetch<Data, Entry, Parsed>(dataURL: string, onProgressUpdate: ProgressUpdateCallback): Promise<JSONDataProvider<Data, Entry, Parsed>> {
        onProgressUpdate(DBOperation.FetchData);
        const dictUrl = chrome.runtime.getURL(dataURL);
        const response = await fetch(dictUrl);
        const data = await response.json() as Data;
        return new JSONDataProvider(data);
    }

    async parse(readEntries: ReadEntriesCallback<Data, Entry>, parseEntry: ParseEntryCallback<Entry, Parsed>, onProgressUpdate: ProgressUpdateCallback) {
        const entries = readEntries(this.data);
        onProgressUpdate(DBOperation.ParseData, 0, entries.length);
        const checkpoints: number[] = [0.25, 0.5, 0.75, 0.9, 1.0].map(pct => Math.floor((entries.length - 1) * pct));
        const promises = entries.map(async (entry, index, arr) => {
            if (checkpoints.includes(index)) {
                onProgressUpdate(DBOperation.ParseData, index + 1, arr.length);
            }
            return parseEntry(entry);
        });
        return awaitSequential(promises);
    }
}