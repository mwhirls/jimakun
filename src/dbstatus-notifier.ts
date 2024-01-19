import { RuntimeMessage, RuntimeEvent, DBStatusResult, Operation, Status, DataSource, Progress } from "./util/events";

const DB_STATUS_KEY = "dbStatus";

export async function setDBStatusReady() {
    const result: DBStatusResult = {
        status: {
            type: Status.Ready,
        }
    }
    updateStatus(result);
}

export async function setDBStatusBlocked() {
    const result: DBStatusResult = {
        status: {
            type: Status.Blocked,
        }
    }
    updateStatus(result);
}

export async function setDBStatusBusy(operation: Operation, progress?: Progress, source?: DataSource) {
    const result: DBStatusResult = {
        status: {
            type: Status.Busy,
            operation,
            progress,
            source
        }
    }
    updateStatus(result);
}

export async function getDBStatus(): Promise<DBStatusResult> {
    const kv = await chrome.storage.local.get(DB_STATUS_KEY);
    const value = kv[DB_STATUS_KEY];
    return value as DBStatusResult; // todo: validate
}

async function updateStatus(result: DBStatusResult) {
    const data = { [DB_STATUS_KEY]: result };
    try {
        await chrome.storage.local.set(data);
        notifyContentScripts(result);
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
                chrome.tabs.sendMessage(tab.id, message);
            }
        }
    } catch (e) {
        console.warn('unable to notify content scripts of database status change', e);
    }
}