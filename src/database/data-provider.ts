import { Checkpoints } from "../common/progress";
import { ProgressUpdateCallback, DBOperation } from "./database";

type ReadEntriesCallback<Data, Entry> = (data: Data) => Entry[];
type ParseEntryCallback<Original, Parsed> = (entry: Original) => Parsed;

export class JSONDataProvider<Data, Entry, Parsed> {
    data: Data;

    constructor(data: Data) {
        this.data = data;
    }

    static async fetch<Data, Entry, Parsed>(dataURL: string, onProgressUpdate: ProgressUpdateCallback): Promise<JSONDataProvider<Data, Entry, Parsed>> {
        await onProgressUpdate(DBOperation.FetchData);
        const dictUrl = chrome.runtime.getURL(dataURL);
        const response = await fetch(dictUrl);
        const data = await response.json() as Data;
        return new JSONDataProvider(data);
    }

    count(readEntries: ReadEntriesCallback<Data, Entry>) {
        const entries = readEntries(this.data);
        return entries.length;
    }

    async parse(readEntries: ReadEntriesCallback<Data, Entry>, parseEntry: ParseEntryCallback<Entry, Parsed>, onProgressUpdate: ProgressUpdateCallback) {
        const entries = readEntries(this.data);
        const checkpoints = Checkpoints.generate(entries.length - 1);
        const promises = entries.map(async (entry, index, arr) => {
            const parsed = parseEntry(entry);
            if (checkpoints.includes(index)) {
                await onProgressUpdate(DBOperation.ParseData, index + 1, arr.length);
            }
            return parsed;
        });
        return Promise.all(promises);
    }
}