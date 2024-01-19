export class LocalStorageObject<T> {
    key: string;

    constructor(key: string) {
        this.key = key;
    }

    async set(value: T) {
        const data = { [this.key]: value };
        return chrome.storage.local.set(data);
    }

    async get(): Promise<T> {
        const kv = await chrome.storage.local.get(this.key);
        const value = kv[this.key];
        return value as T; // todo: validate
    }

    async clear() {
        return chrome.storage.local.remove(this.key);
    }
}