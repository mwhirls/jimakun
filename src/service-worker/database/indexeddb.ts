import { Checkpoints } from "../../common/progress";

export const DBErrorType = {
    Blocked: 'BLOCKED',
    UpgradeFailed: 'UPGRADE_FAILED',
    TransactionError: 'TRANSACTION_ERROR',
    Unknown: 'UNKNOWN',
} as const;
export type DBErrorType = typeof DBErrorType[keyof typeof DBErrorType];

export class DatabaseError extends Error {
    type: DBErrorType;

    constructor(type: DBErrorType, message?: string) {
        super(message);
        this.type = type;
        this.name = "DatabaseError";
    }
}

export interface DBIndex {
    name: string;
    unique: boolean;
    multiEntry: boolean;
}

export interface DBStore {
    name: string;
    keyPath: string;
    indexes: DBIndex[];
}

export class DBStoreUpgradeContext {
    wrapper: IDBWrapper;
    requests: Promise<void>[];

    constructor(wrapper: IDBWrapper) {
        this.wrapper = wrapper;
        this.requests = [];
    }

    exists(store: DBStore) {
        return this.wrapper.db.objectStoreNames.contains(store.name);
    }

    create(stores: DBStore[]) {
        const requests = stores.map((store) => {
            return new Promise<void>((resolve, reject) => {
                const objectStore = this.wrapper.db.createObjectStore(store.name, { keyPath: store.keyPath });
                objectStore.transaction.addEventListener('complete', () => {
                    resolve();
                });
                objectStore.transaction.addEventListener('abort', () => {
                    reject(new DatabaseError(DBErrorType.TransactionError));
                });
                objectStore.transaction.addEventListener('error', () => {
                    reject(new DatabaseError(DBErrorType.TransactionError));
                });
                for (const index of store.indexes) {
                    objectStore.createIndex(index.name, index.name, { unique: index.unique, multiEntry: index.multiEntry });
                }
            })
        });
        this.requests.push(...requests);
    }

    delete(stores: DBStore[]) {
        const requests = stores.map((store) => {
            return new Promise<void>(() => {
                this.wrapper.db.deleteObjectStore(store.name);
            })
        });
        this.requests.push(...requests);
    }
}

export class IDBUpgradeContext {
    readonly wrapper: IDBWrapper;
    private readonly context: DBStoreUpgradeContext;

    constructor(wrapper: IDBWrapper) {
        this.wrapper = wrapper;
        this.context = new DBStoreUpgradeContext(wrapper);
    }

    getContext(): DBStoreUpgradeContext {
        return this.context;
    }

    async commit() {
        for (const request of this.context.requests) {
            await request;
        }
        return this.wrapper;
    }
}

export enum DBOperation {
    Open,
    Upgrade,
    FetchData,
    ParseData,
    PutData,
    Delete,
}

export type ProgressUpdateCallback = (operation: DBOperation, value?: number, max?: number) => Promise<void>;

export interface IDBObjectStoreWrapper {
    name(): string;
    populate(onProgressUpdate: ProgressUpdateCallback): Promise<void>;
}

export interface DBStoreUpgrade {
    db: DBStoreUpgradeContext;
    apply(): void;
}

export interface Pagination {
    page: number;
    perPage: number
}

export class IDBWrapper {
    readonly db: IDBDatabase;
    readonly upgraded: boolean;
    readonly onVersionChange: () => void;

    constructor(db: IDBDatabase, upgraded: boolean, onVersionChange: () => void) {
        this.db = db;
        this.upgraded = upgraded;
        this.onVersionChange = onVersionChange;
    }

    static async open(name: string, version: number, onUpgrade: (db: IDBUpgradeContext) => Promise<IDBWrapper>, onVersionChange: () => void): Promise<IDBWrapper> {
        return new Promise((resolve, reject) => {
            const request = self.indexedDB.open(name, version);
            request.onblocked = () => {
                reject(new DatabaseError(DBErrorType.Blocked, `${request.error?.name}`));
            };
            request.onerror = () => {
                reject(new DatabaseError(DBErrorType.Unknown, `${request.error?.name}`));
            };
            request.onsuccess = () => {
                const db = request.result;
                const wrapper = new IDBWrapper(db, false, onVersionChange)
                db.onversionchange = () => {
                    db.close(); // close to allow upgrading database instances in another tab upgrade
                    wrapper.onVersionChange();
                };
                resolve(wrapper);
            };
            request.onupgradeneeded = () => {
                if (!request.result) {
                    reject(new DatabaseError(DBErrorType.UpgradeFailed, `${request.error?.name}`))
                    return;
                }
                const db = request.result;
                const context = new IDBUpgradeContext(new IDBWrapper(db, true, onVersionChange));
                resolve(onUpgrade(context));
            };
        });
    }

    static async delete(name: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = self.indexedDB.deleteDatabase(name);
            request.onblocked = () => {
                reject(new DatabaseError(DBErrorType.Blocked, `${request.error?.name}`));
            };
            request.onerror = () => {
                reject(new DatabaseError(DBErrorType.Unknown, `${request.error?.name}`));
            };
            request.onsuccess = () => {
                resolve();
            };
        });
    }

    close() {
        this.db.close();
    }

    putAll(store: DBStore, entries: unknown[], onProgressUpdate: ProgressUpdateCallback): Promise<void[]> {
        const checkpoints = Checkpoints.generate(entries.length - 1);
        const transaction = this.db.transaction(store.name, "readwrite");
        const objectStore = transaction.objectStore(store.name);
        const results = entries.map((entry, index, arr) => {
            return new Promise<void>((resolve, reject) => {
                const request = objectStore.put(entry);

                // only track progress at certain checkpoints in order to improve performance
                if (checkpoints.includes(index)) {
                    request.onerror = () => {
                        reject(new DatabaseError(DBErrorType.TransactionError));
                    };
                    request.onsuccess = () => {
                        resolve(onProgressUpdate(DBOperation.PutData, index + 1, arr.length))
                    };
                } else {
                    resolve();
                }
            })
        });
        transaction.commit();
        return Promise.all(results);
    }

    countRecords(store: DBStore) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(store.name, "readwrite");
            const objectStore = transaction.objectStore(store.name);
            const request = objectStore.count();
            request.onerror = () => {
                reject(new DatabaseError(DBErrorType.TransactionError));
            };
            request.onsuccess = () => {
                resolve(request.result)
            };
            transaction.commit();
        });
    }

    countQueryResults(store: DBStore, index: DBIndex, query: IDBValidKey): Promise<number> {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(store.name, "readwrite");
            const request = transaction
                .objectStore(store.name)
                .index(index.name)
                .count(query);
            request.onerror = () => {
                reject(new DatabaseError(DBErrorType.TransactionError));
            };
            request.onsuccess = () => {
                resolve(request.result)
            };
            transaction.commit();
        });
    }

    get<T>(store: DBStore, query: IDBValidKey): Promise<T | undefined> {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(store.name)
                .objectStore(store.name)
                .get(query);
            request.onerror = () => {
                reject(new DatabaseError(DBErrorType.TransactionError));
            };
            request.onsuccess = () => {
                resolve(request.result)
            };
        });
    }

    getFromIndex<T>(store: DBStore, index: DBIndex, query: IDBValidKey): Promise<T | undefined> {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(store.name)
                .objectStore(store.name)
                .index(index.name)
                .get(query);
            request.onerror = () => {
                reject(new DatabaseError(DBErrorType.TransactionError));
            };
            request.onsuccess = () => {
                resolve(request.result)
            };
        });
    }

    openCursorOnIndex<T>(store: DBStore, index: DBIndex, query: IDBValidKey, pagination?: Pagination): Promise<T[]> {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(store.name)
                .objectStore(store.name)
                .index(index.name)
                .openCursor(query);
            request.onerror = () => {
                reject(new DatabaseError(DBErrorType.TransactionError));
            };
            const results: T[] = [];
            let advanced = false;
            request.onsuccess = () => {
                const cursor = request.result;
                if (!cursor || (pagination && results.length === pagination.perPage)) {
                    resolve(results);
                    return;
                }
                if (!advanced && pagination) {
                    const offset = pagination.page * pagination.perPage;
                    if (offset) {
                        cursor.advance(offset);
                    } else {
                        results.push(cursor.value);
                        cursor.continue();
                    }
                    advanced = true;
                    return;
                }
                results.push(cursor.value);
                cursor.continue();
            };
        });
    }
}