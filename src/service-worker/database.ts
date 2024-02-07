import { IDBUpgradeContext, IDBObjectStoreWrapper, DBOperation, IDBWrapper, DatabaseError, DBErrorType } from './database/indexeddb';
import { JMDictStoreUpgrade, JMDictStore } from './database/jmdict';
import { KanjiDic2StoreUpgrade, KanjiDic2Store } from './database/kanjidic2';
import { TatoebaStoreUpgrade, TatoebaStore } from './database/tatoeba';
import * as DBStatusManager from './database/dbstatus';

const DB_NAME = 'jimakun';
const DB_VERSION = 3;

async function onDBUpgrade(db: IDBUpgradeContext) {
    const ctx = db.getContext();
    const upgrades = [
        new JMDictStoreUpgrade(ctx),
        new KanjiDic2StoreUpgrade(ctx),
        new TatoebaStoreUpgrade(ctx),
    ];
    upgrades.map(x => x.apply());
    return db.commit();
}

async function onDBVersionChanged() {
    await DBStatusManager.setDBStatusVersionChanged();
}

async function populateObjectStore(store: IDBObjectStoreWrapper) {
    const source = Object.values(DBStatusManager.DataSource).find(x => x === store.name());
    await DBStatusManager.setDBStatusBusyIndeterminate(DBOperation.Open);
    await store.populate(async (operation: DBOperation, value?: number, max?: number) => {
        if (value && max) {
            return DBStatusManager.setDBStatusBusyDeterminate(operation, value, max, source);
        }
        return DBStatusManager.setDBStatusBusyIndeterminate(operation, source);
    });
}

async function populateDatabase(db: IDBWrapper) {
    // make sure object stores have the latest data
    const objectStores = [
        new JMDictStore(db),
        new KanjiDic2Store(db),
        new TatoebaStore(db),
    ];
    for (const store of objectStores) {
        await populateObjectStore(store)
    }
}

export async function initializeDatabase() {
    try {
        await DBStatusManager.clearStatus()
        await DBStatusManager.setDBStatusBusyIndeterminate(DBOperation.Open);
        const db = await IDBWrapper.open(DB_NAME, DB_VERSION, onDBUpgrade, onDBVersionChanged);
        await populateDatabase(db);
        await DBStatusManager.setDBStatusReady();
    } catch (e) {
        handleDatabaseError(e);
        throw e;
    }
}

async function deleteDatabase() {
    await DBStatusManager.setDBStatusBusyIndeterminate(DBOperation.Delete);
    await IDBWrapper.delete(DB_NAME);
}

export async function purgeReimport() {
    try {
        await DBStatusManager.clearStatus();
        await deleteDatabase();
        await initializeDatabase();
    } catch (e) {
        handleDatabaseError(e);
        throw e;
    }
}

function handleDatabaseError(e: unknown) {
    if (e instanceof DatabaseError) {
        if (e.type === DBErrorType.Blocked) {
            DBStatusManager.setDBStatusBlocked();
        } else {
            DBStatusManager.setDBStatusError(e);
        }
    } else if (e instanceof Error) {
        DBStatusManager.setDBStatusError(e);
    } else {
        DBStatusManager.setDBStatusError(new Error('unknown error'));
    }
}

export async function openJMDict() {
    return JMDictStore.open(DB_NAME, DB_VERSION, onDBUpgrade, onDBVersionChanged);
}

export async function openKanjiDic2() {
    return KanjiDic2Store.open(DB_NAME, DB_VERSION, onDBUpgrade, onDBVersionChanged);
}

export async function openTatoeba() {
    return TatoebaStore.open(DB_NAME, DB_VERSION, onDBUpgrade, onDBVersionChanged);
}