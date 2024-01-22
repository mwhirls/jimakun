import React, { useState, useEffect } from "react";
import { DBStatusResult, Status } from "../../database/dbstatus";
import { LocalStorageChangedListener, LocalStorageObject } from "../../storage/local-storage";
import Spinner from "../../common/components/Spinner";

const DB_STATUS_KEY = 'lastDBStatusResult'

interface PurgeButtonProps {
    onClick: () => void;
}

function PurgeButton({ onClick }: PurgeButtonProps) {
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

    const disabled = !dbStatus || dbStatus.status.type == Status.Busy;
    const content = () => {
        switch (dbStatus?.status.type) {
            case Status.Busy:
                return (
                    <>
                        <span className="w-8 inline-block align-middle mr-4">
                            <Spinner color='white' thickness={3}></Spinner>
                        </span>
                        <span className="inline-block">Processing...</span>
                    </>
                )
            default:
                return <>Purge</>
        }
    }

    return (
        <button className="text-white text-3xl font-bold py-2 px-4 bg-red-600 border border-solid border-slate-400 rounded-md hover:bg-red-500 active:bg-red-700 disabled:opacity-75 disabled:bg-slate-400" disabled={disabled} onClick={() => onClick()}>
            {content()}
        </button>
    )
}

export default PurgeButton;