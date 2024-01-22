import React, { useState, useEffect } from "react";
import { RuntimeMessage, RuntimeEvent } from "../../common/events";
import { DBStatusResult, Status } from "../../database/dbstatus";
import { LocalStorageChangedListener, LocalStorageObject } from "../../storage/local-storage";
import Spinner from "../../common/components/Spinner";

const DB_STATUS_KEY = 'lastDBStatusResult'

async function purgeDictionaries(): Promise<number> {
    const message: RuntimeMessage = { event: RuntimeEvent.PurgeDictionaries, data: undefined };
    return chrome.runtime.sendMessage(message);
}

function ProcessingButton() {
    return (
        <button className="disabled:opacity-75">
            <span className="w-8 inline-block align-middle mr-4">
                <Spinner color='white' thickness={3}></Spinner>
            </span>
            <span className="inline-block">Processing...</span>
        </button>
    )
}

function NormalButton() {
    return (
        <button className="hover:bg-red-700 active:bg-red-800" onClick={() => purgeDictionaries()}>Purge</button>
    )
}

function PurgeButton() {
    const [dbStatus, setDBStatus] = useState<DBStatusResult | null>(null);

    useEffect(() => {
        const storage = new LocalStorageObject<DBStatusResult>(DB_STATUS_KEY);
        const onStatusChanged = LocalStorageChangedListener.create(storage, (_, newValue) => setDBStatus(newValue));
        storage.addOnChangedListener(onStatusChanged);
        storage.get().then(status => setDBStatus(status));

        return () => {
            storage.removeOnChangedListener(onStatusChanged);
        }
    }, []);

    if (!dbStatus) {
        return <ProcessingButton></ProcessingButton>;
    }

    const content = () => {
        switch (dbStatus.status.type) {
            case Status.Busy:
                return <ProcessingButton></ProcessingButton>
            default:
                return <NormalButton></NormalButton>
        }
    }

    return (
        <div className="text-white text-3xl font-bold py-2 px-4 bg-red-600 border border-solid border-slate-400 rounded-md ">
            <ProcessingButton></ProcessingButton>
        </div>
    )
}

export default PurgeButton;