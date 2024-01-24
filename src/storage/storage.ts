import { LocalStorageChangedListener, LocalStorageObject } from "./local-storage";
import { SessionStorageChangedListener, SessionStorageObject } from "./session-storage";

export type Changes = { [key: string]: chrome.storage.StorageChange; };
export type StorageAreaChanged = (changes: Changes) => void;

export enum StorageType {
    Session,
    Local,
}

export class StorageListener<T> {
    listener: SessionStorageChangedListener | LocalStorageChangedListener;

    constructor(storage: StorageObject<T>, callback: (oldValue: T, newValue: T) => void) {
        const object = storage.storage;
        if (object instanceof SessionStorageObject) {
            this.listener = SessionStorageChangedListener.create(object, callback);
        } else if (object instanceof LocalStorageObject) {
            this.listener = LocalStorageChangedListener.create(object, callback);
        } else {
            throw new Error('unrecognized storage object');
        }
    }
}

export class StorageObject<T> {
    storage: SessionStorageObject<T> | LocalStorageObject<T>;

    constructor(key: string, type: StorageType) {
        if (type === StorageType.Session) {
            this.storage = new SessionStorageObject<T>(key);
        } else if (type === StorageType.Local) {
            this.storage = new LocalStorageObject<T>(key);
        } else {
            throw new Error('unrecognized storage type');
        }
    }

    async set(value: T): Promise<void> {
        return this.storage.set(value);
    }

    async get(): Promise<T | undefined> {
        return this.storage.get();
    }

    async clear(): Promise<void> {
        return this.storage.clear();
    }

    addOnChangedListener(listener: StorageListener<T>) {
        return this.storage.addOnChangedListener(listener.listener);
    }

    removeOnChangedListener(listener: StorageListener<T>) {
        return this.storage.addOnChangedListener(listener.listener);
    }
}