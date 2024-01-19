import { RuntimeMessage, RuntimeEvent, DBStatusResult, Operation, Status, DataSource } from "./util/events";

const DB_STATUS_KEY = "dbStatus";

export function setDBStatusReady() {
    const result: DBStatusResult = {
        status: {
            type: Status.Ready,
        }
    }
    const data = { [DB_STATUS_KEY]: result };
    return chrome.storage.local.set(data).then(() => notifyContentScripts(result));
}

export function setDBStatusBlocked() {
    const result: DBStatusResult = {
        status: {
            type: Status.Blocked,
        }
    }
    const data = { [DB_STATUS_KEY]: result };
    return chrome.storage.local.set(data).then(() => notifyContentScripts(result));
}

export function setDBStatusBusy(operation: Operation, value: number, max: number, source?: DataSource) {
    const result: DBStatusResult = {
        status: {
            type: Status.Busy,
            operation,
            progress: {
                value,
                max
            },
            source
        }
    }
    const data = { [DB_STATUS_KEY]: result };
    return chrome.storage.local.set(data).then(() => notifyContentScripts(result));
}

export function getDBStatus() {
    return chrome.storage.local.get([DB_STATUS_KEY]).then(value => {
        const result = value as DBStatusResult; // TODO: validate
        notifyContentScripts(result)
    });
}

function notifyContentScripts(result: DBStatusResult) {
    const message: RuntimeMessage = { event: RuntimeEvent.MovieUpdated, data: result };
    chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
            if (tab.id) {
                chrome.tabs.sendMessage(tab.id, message);
            }
        }
    });
}