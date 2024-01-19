import { DBOperation } from "./database/database";
import { RuntimeMessage, RuntimeEvent, DBStatusResult, Status, DataSource } from "./util/events";
import { ProgressType } from "./util/progress";
import * as tabs from './tabs';
import { LocalStorageObject } from "./local-storage";

const DB_STATUS_KEY = 'lastDBStatusResult'

export async function notifyDBStatusReady() {
    const result: DBStatusResult = {
        status: {
            type: Status.Ready,
        }
    }
    return updateStatus(result);
}

export async function notifyDBStatusBlocked() {
    const result: DBStatusResult = {
        status: {
            type: Status.Blocked,
        }
    }
    return updateStatus(result);
}

export async function notifyDBStatusBusyDeterminate(operation: DBOperation, value: number, max: number, source?: DataSource) {
    const result: DBStatusResult = {
        status: {
            type: Status.Busy,
            operation,
            progress: {
                type: ProgressType.Determinate,
                value,
                max
            },
            source
        }
    }
    return updateStatus(result);
}

export async function notifyDBStatusBusyIndeterminate(operation: DBOperation, source?: DataSource) {
    const result: DBStatusResult = {
        status: {
            type: Status.Busy,
            operation,
            progress: {
                type: ProgressType.Indeterminate
            },
            source
        }
    }
    return updateStatus(result);
}

export async function notifyDBStatusError(e?: Error) {
    const result: DBStatusResult = {
        status: {
            type: Status.ErrorOccurred,
            message: e?.message,
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
        await notifyContentScripts(result);
        const storage = new LocalStorageObject<DBStatusResult>(DB_STATUS_KEY);
        return storage.set(result);
    } catch (e) {
        console.error(e);
    }
}

async function notifyContentScripts(result: DBStatusResult) {
    const message: RuntimeMessage = { event: RuntimeEvent.ReportDBStatus, data: result };
    return tabs.sendMessageToAll(message);
}