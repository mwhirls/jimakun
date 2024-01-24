import { RuntimeMessage } from "../../common/events";
import { StorageListener, StorageObject, StorageType } from "../../storage/storage";
import { ExtensionContext } from "../contexts/ExtensionContext";

function isValidRuntime() {
    return !!chrome.runtime?.id;
}

export class BrowserStorageListener<T> {
    listener: StorageListener<T>;

    private constructor(storage: BrowserStorage<T>, callback: (oldValue: T, newValue: T) => void) {
        this.listener = new StorageListener(storage.storage, callback);
    }

    static create<T>(storage: BrowserStorage<T>, callback: (oldValue: T, newValue: T) => void, context: ExtensionContext): BrowserStorageListener<T> | undefined {
        if (!isValidRuntime()) {
            context.onInvalidated();
            return undefined;
        }
        return new BrowserStorageListener(storage, callback);
    }
}

export class BrowserStorage<T> {
    storage: StorageObject<T>;
    context: ExtensionContext;

    constructor(key: string, type: StorageType, context: ExtensionContext) {
        this.storage = new StorageObject<T>(key, type);
        this.context = context;
    }

    async set(value: T): Promise<void> {
        if (!isValidRuntime()) {
            this.context.onInvalidated();
            return;
        }
        return this.storage.set(value);
    }

    async get(): Promise<T | undefined> {
        if (!isValidRuntime()) {
            this.context.onInvalidated();
            return;
        }
        return this.storage.get();
    }

    async clear(): Promise<void> {
        if (!isValidRuntime()) {
            this.context.onInvalidated();
            return;
        }
        return this.storage.clear();
    }

    addOnChangedListener(listener: BrowserStorageListener<T>) {
        if (!isValidRuntime()) {
            this.context.onInvalidated();
            return;
        }
        return this.storage.addOnChangedListener(listener.listener);
    }

    removeOnChangedListener(listener: BrowserStorageListener<T>) {
        if (!isValidRuntime()) {
            this.context.onInvalidated();
            return;
        }
        return this.storage.addOnChangedListener(listener.listener);
    }
}

export function sendMessage(message: RuntimeMessage, context: ExtensionContext) {
    if (!isValidRuntime()) {
        context.onInvalidated();
        return;
    }
    return chrome.runtime.sendMessage(message);
}