export enum DBErrorType {
    Blocked = 'BLOCKED',
    UpgradeFailed = 'UPGRADE_FAILED',
    TransactionError = 'TRANSACTION_ERROR',
    Unknown = 'UNKNOWN',
}

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
        await Promise.all(this.context.requests);
        return this.wrapper;
    }
}

export enum DBStoreOperation {
    LoadData,
    PutData,
    Index,
}

export interface DBStoreUpgrade {
    db: DBStoreUpgradeContext;
    apply(): void;
}

function openIndexedDB(name: string, version: number, onUpgrade: (db: IDBUpgradeContext) => Promise<IDBWrapper>): Promise<IDBWrapper> {
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
            resolve(new IDBWrapper(db, false));
        };
        request.onupgradeneeded = () => {
            if (!request.result) {
                reject(new DatabaseError(DBErrorType.UpgradeFailed, `${request.error?.name}`))
                return;
            }
            const db = request.result;
            db.onversionchange = () => {
                db.close(); // close to allow new database instances in other tabs to upgrade
            };
            onUpgrade(new IDBUpgradeContext(new IDBWrapper(db, true)))
                .then(wrapper => {
                    resolve(wrapper);
                })
                .catch(e => reject(e));
        };
    });
}

export interface Pagination {
    page: number;
    perPage: number
}

export class IDBWrapper {
    readonly db: IDBDatabase;
    readonly upgraded: boolean;

    constructor(db: IDBDatabase, upgraded: boolean) {
        this.db = db;
        this.upgraded = upgraded;
    }

    static async open(name: string, version: number, onUpgrade: (db: IDBUpgradeContext) => Promise<IDBWrapper>): Promise<IDBWrapper>;
    static async open(name: string, version: number, onUpgrade: (db: IDBUpgradeContext) => Promise<IDBWrapper>, attempts?: number): Promise<IDBWrapper>;
    static async open(name: string, version: number, onUpgrade: (db: IDBUpgradeContext) => Promise<IDBWrapper>, attempts?: number): Promise<IDBWrapper> {
        if (!attempts) {
            return await openIndexedDB(name, version, onUpgrade);
        }
        if (attempts <= 0) {
            throw new Error('unable to open database after multiple attempts; aborting');
        }
        try {
            return await openIndexedDB(name, version, onUpgrade);
        } catch (e: unknown) {
            if (e instanceof DatabaseError && e.type === DBErrorType.Blocked) {
                // re-attempt
                console.warn('database was blocked; attempting to reopen...');
                return IDBWrapper.open(name, version, onUpgrade, --attempts);
            } else {
                throw e;
            }
        }
    }

    putAll(store: DBStore, entries: unknown[], onProgressTick: (op: DBStoreOperation, value: number, max: number) => void, checkpoints: number[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(store.name, "readwrite");
            const objectStore = transaction.objectStore(store.name);
            for (let i = 0; i < entries.length; i++) {
                const request = objectStore.put(entries[i]);

                // only track progress at certain checkpoints in order to improve performance
                const checkpoint = checkpoints.includes(i);
                if (checkpoint) {
                    onProgressTick(DBStoreOperation.PutData, i + 1, entries.length);
                    request.onerror = () => {
                        reject(new DatabaseError(DBErrorType.TransactionError));
                    };
                    request.onsuccess = () => {
                        onProgressTick(DBStoreOperation.Index, i + 1, entries.length);
                        resolve()
                    };
                }
            }
            transaction.commit();
        });
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