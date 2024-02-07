import { DBOperation } from "./indexeddb";
import { Progress } from "../../common/progress";
import { LocalStorageObject } from "../../storage/local-storage";

const DB_STATUS_KEY = 'lastDBStatusResult'

export enum DataSource {
    JMDict = 'jmdict',
    KanjiDic2 = 'kanji-dic2',
    Tatoeba = 'tatoeba',
    Unknown = '',
}

export enum Status {
    Ready = 'ready',
    Blocked = 'blocked',
    Busy = 'busy',
    ErrorOccurred = 'error-occurred',
    VersionChanged = 'version-changed',
}

export interface Ready {
    type: Status.Ready;
}

export interface Blocked {
    type: Status.Blocked;
}

export interface Busy {
    type: Status.Busy;
    operation: DBOperation;
    progress: Progress;
    source?: DataSource;
}

export interface ErrorOccurred {
    type: Status.ErrorOccurred;
    message: string;
}

export interface VersionChanged {
    type: Status.VersionChanged;
}

export interface DBStatusResult {
    status: Ready | Blocked | Busy | ErrorOccurred | VersionChanged;
}

export async function setDBStatusReady() {
    const result: DBStatusResult = {
        status: {
            type: Status.Ready,
        }
    }
    return updateStatus(result);
}

export async function setDBStatusBlocked() {
    const result: DBStatusResult = {
        status: {
            type: Status.Blocked,
        }
    }
    return updateStatus(result);
}

export async function setDBStatusBusyDeterminate(operation: DBOperation, value: number, max: number, source?: DataSource) {
    const result: DBStatusResult = {
        status: {
            type: Status.Busy,
            operation,
            progress: {
                type: "determinate",
                value,
                max
            },
            source
        }
    }
    return updateStatus(result);
}

export async function setDBStatusBusyIndeterminate(operation: DBOperation, source?: DataSource) {
    const result: DBStatusResult = {
        status: {
            type: Status.Busy,
            operation,
            progress: {
                type: "indeterminate"
            },
            source
        }
    }
    return updateStatus(result);
}

export async function setDBStatusError(e: Error) {
    const result: DBStatusResult = {
        status: {
            type: Status.ErrorOccurred,
            message: e.message,
        }
    }
    return updateStatus(result);
}

export async function setDBStatusVersionChanged() {
    const result: DBStatusResult = {
        status: {
            type: Status.VersionChanged,
        }
    }
    return updateStatus(result);
}

export async function clearStatus() {
    const storage = new LocalStorageObject<DBStatusResult>(DB_STATUS_KEY);
    return storage.clear();
}

export async function getDBStatus(): Promise<DBStatusResult> {
    const storage = new LocalStorageObject<DBStatusResult>(DB_STATUS_KEY);
    return storage.get();
}

async function updateStatus(result: DBStatusResult) {
    try {
        const storage = new LocalStorageObject<DBStatusResult>(DB_STATUS_KEY);
        return storage.set(result);
    } catch (e) {
        console.error(e);
    }
}