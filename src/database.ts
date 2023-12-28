export enum DBErrorType {
    Blocked = 'BLOCKED',
    UpgradeFailed = 'UPGRADE_FAILED',
    TransactionError = 'TRANSACTION_ERROR',
    Unknown = 'UNKNOWN',
}

export class DatabaseError extends Error {
    type: DBErrorType;

    constructor(type: DBErrorType, message?: string) {
        super(type);
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

export class IDBUpgradeContext {
    wrapper: IDBWrapper;

    constructor(wrapper: IDBWrapper) {
        this.wrapper = wrapper;
    }

    declare(stores: DBStore[]): Promise<void[]> {
        const result = stores.map((store) => {
            return new Promise<void>((resolve, reject) => {
                const objectStore = this.wrapper.db.createObjectStore(store.name, { keyPath: store.keyPath });
                for (const index of store.indexes) {
                    objectStore.createIndex(index.name, index.name, { unique: index.unique, multiEntry: index.multiEntry });
                }
                objectStore.transaction.oncomplete = (event) => {
                    resolve();
                };
                objectStore.transaction.onerror = (event) => {
                    reject(new DatabaseError(DBErrorType.TransactionError));
                }
            })
        });
        return Promise.all(result);
    }

    insert(storeName: string, entries: any[]) {
        const store = this.wrapper.db.transaction(storeName, "readwrite").objectStore(storeName);
        for (const entry of entries) {
            store.add(entry);
        }
    }
}

export class IDBWrapper {
    readonly db: IDBDatabase;

    constructor(db: IDBDatabase) {
        this.db = db;
    }

    static open(name: string, version: number, onUpgrade: (db: IDBUpgradeContext) => void): Promise<IDBWrapper> {
        return new Promise((resolve, reject) => {
            const request = self.indexedDB.open(name, version);
            request.onblocked = (event: any) => {
                reject(new DatabaseError(DBErrorType.Blocked, `${event.target?.errorCode}`));
            };
            request.onerror = (event: any) => {
                reject(new DatabaseError(DBErrorType.Unknown, `${event.target?.errorCode}`));
            };
            request.onsuccess = () => {
                const db = request.result;
                resolve(new IDBWrapper(db));
            };
            request.onupgradeneeded = (event: any) => {
                if (!request.result) {
                    reject(new DatabaseError(DBErrorType.UpgradeFailed, `${event.target?.errorCode}`))
                    return;
                }
                const db = request.result;
                db.onversionchange = () => {
                    db.close(); // close to allow new database instances in other tabs to upgrade
                };
                const wrapper = new IDBWrapper(db);
                onUpgrade(new IDBUpgradeContext(wrapper));
                resolve(wrapper);
            };
        });
    }

    get<T>(storeName: string, indexName: string, query: IDBValidKey): Promise<T | undefined> {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(storeName)
                .objectStore(storeName)
                .index(indexName)
                .get(query);
            request.onerror = (_event: any) => {
                reject(new DatabaseError(DBErrorType.TransactionError));
            };
            request.onsuccess = (event: any) => {
                resolve(request.result)
            };
        });
    }
}