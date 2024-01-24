import './popup.css'
import React, { useContext, useEffect, useState } from "react";
import ReactDOM from 'react-dom/client';
import DatabaseBlocked from "../common/components/DatabaseBlocked";
import DatabaseBusy from "../common/components/DatabaseBusy";
import DatabaseError from "../common/components/DatabaseError";
import DatabaseReady from "./components/DatabaseReady";
import { DBStatusResult, Status } from '../database/dbstatus';
import { BrowserStorage, BrowserStorageListener } from '../content-scripts/util/browser-runtime';
import { ChromeExtensionContext } from '../content-scripts/contexts/ExtensionContext';
import { StorageType } from '../storage/storage';

const DB_STATUS_KEY = 'lastDBStatusResult'

function Popup() {
    const [dbStatus, setDBStatus] = useState<DBStatusResult | null>(null);
    const context = useContext(ChromeExtensionContext);

    useEffect(() => {
        const storage = new BrowserStorage<DBStatusResult>(DB_STATUS_KEY, StorageType.Local, context);
        const onStatusChanged = BrowserStorageListener.create(storage, (_, newValue) => setDBStatus(newValue), context);
        if (onStatusChanged) {
            storage.addOnChangedListener(onStatusChanged);
        }
        storage.get().then(status => {
            if (status) {
                setDBStatus(status);
            }
        });

        return () => {
            if (onStatusChanged) {
                storage.removeOnChangedListener(onStatusChanged);
            }
        }
    }, []);

    if (!dbStatus) {
        return <></>;
    }

    const content = () => {
        switch (dbStatus.status.type) {
            case Status.Ready:
                return <DatabaseReady></DatabaseReady>
            case Status.Blocked:
                return <DatabaseBlocked></DatabaseBlocked>
            case Status.Busy:
                return <DatabaseBusy dbStatus={dbStatus.status}></DatabaseBusy>
            case Status.ErrorOccurred:
                return <DatabaseError></DatabaseError>
        }
    }

    return (
        <div className="bg-white rounded-lg text-black min-w-fit min-h-fit p-6">
            {content()}
        </div>
    );
}

const node = document.getElementById('root');
if (!node) {
    throw new Error('failed to insert React app!');
}
const root = ReactDOM.createRoot(node);
root.render(
    <React.StrictMode>
        <Popup></Popup>
    </React.StrictMode>
);