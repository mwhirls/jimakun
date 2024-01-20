type Changes = { [key: string]: chrome.storage.StorageChange; };
type StorageAreaChanged = (changes: Changes) => void;

export class LocalStorageChangedListener {
    callback: StorageAreaChanged;

    private constructor(callback: StorageAreaChanged) {
        this.callback = callback;
    }

    static create<T>(storage: LocalStorageObject<T>, callback: (oldValue: T, newValue: T) => void) {
        const cb = (changes: Changes) => {
            if (storage.key in changes) {
                const change = changes[storage.key]; // todo: validate
                callback(change.oldValue, change.newValue);
            }
        };
        chrome.storage.local.onChanged.addListener(cb);
        return new LocalStorageChangedListener(cb);
    }
}

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

    addOnChangedListener(listener: LocalStorageChangedListener) {
        chrome.storage.local.onChanged.addListener(listener.callback);
    }

    removeOnChangedListener(listener: LocalStorageChangedListener) {
        chrome.storage.local.onChanged.removeListener(listener.callback);
    }
}