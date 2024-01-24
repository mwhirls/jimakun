import { StorageAreaChanged, Changes, StorageType } from "./storage";

export class SessionStorageChangedListener {
    callback: StorageAreaChanged;

    private constructor(callback: StorageAreaChanged) {
        this.callback = callback;
    }

    static create<T>(storage: SessionStorageObject<T>, callback: (oldValue: T, newValue: T) => void) {
        const cb = (changes: Changes) => {
            if (storage.key in changes) {
                const change = changes[storage.key]; // todo: validate
                callback(change.oldValue, change.newValue);
            }
        };
        return new SessionStorageChangedListener(cb);
    }
}

export class SessionStorageObject<T> {
    type: StorageType.Session;
    key: string;

    constructor(key: string) {
        this.type = StorageType.Session;
        this.key = key;
    }

    async set(value: T) {
        const data = { [this.key]: value };
        return chrome.storage.session.set(data);
    }

    async get(): Promise<T> {
        const tryGet = async () => {
            const kv = await chrome.storage.session.get(this.key);
            const value = kv[this.key];
            return value as T; // todo: validate
        }
        try {
            return tryGet();
        } catch (e) {
            // session storage can't be accessed from content scripts by default
            await chrome.storage.session.setAccessLevel({
                accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS'
            });
        }
        return tryGet();
    }

    async clear() {
        return chrome.storage.session.remove(this.key);
    }

    addOnChangedListener(listener: SessionStorageChangedListener) {
        chrome.storage.session.onChanged.addListener(listener.callback);
    }

    removeOnChangedListener(listener: SessionStorageChangedListener) {
        chrome.storage.session.onChanged.removeListener(listener.callback)
    }
}