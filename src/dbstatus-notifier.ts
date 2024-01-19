import { DBOperation } from "./database/database";
import { RuntimeMessage, RuntimeEvent, DBStatusResult, Status, DataSource } from "./util/events";
import { ProgressType } from "./util/progress";

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

export async function getDBStatus(): Promise<DBStatusResult> {
    const kv = await chrome.storage.local.get(DB_STATUS_KEY);
    const value = kv[DB_STATUS_KEY];
    return value as DBStatusResult; // todo: validate
}

async function updateStatus(result: DBStatusResult) {
    const data = { [DB_STATUS_KEY]: result };
    try {
        await notifyContentScripts(result);
        await chrome.storage.local.set(data);
    } catch (e) {
        console.error(e);
    }
}

async function notifyContentScripts(result: DBStatusResult) {
    const message: RuntimeMessage = { event: RuntimeEvent.ReportDBStatus, data: result };
    try {
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
            if (tab.id) {
                chrome.tabs.sendMessage(tab.id, message, () => {
                    console.warn('unable to notify tab of database status change', chrome.runtime.lastError);
                });
            }
        }
    } catch (e) {
        console.warn('unable to notify tab of database status change', e);
    }
}