import './popup.css'
import React, { useEffect, useState } from "react";
import ReactDOM from 'react-dom/client';
import DatabaseBlocked from "../common/components/DatabaseBlocked";
import DatabaseBusy from "../common/components/DatabaseBusy";
import DatabaseError from "../common/components/DatabaseError";
import { DBStatusResult, Status } from "../common/events";
import DatabaseReady from "./components/Ready";
import { LocalStorageObject, LocalStorageChangedListener } from '../storage/local-storage';

const DB_STATUS_KEY = 'lastDBStatusResult'

function Popup() {
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
        return <></>;
    }

    const content = () => {
        switch (dbStatus.status.type) {
            case Status.Ready:
                return <DatabaseReady></DatabaseReady>
            case Status.Blocked:
                return <DatabaseBlocked dbStatus={dbStatus.status}></DatabaseBlocked>
            case Status.Busy:
                return <DatabaseBusy dbStatus={dbStatus.status} className='w-[20rem] h-[16rem]' titleClassName='text-xl' infoTextClassName='text-base'></DatabaseBusy>
            case Status.ErrorOccurred:
                return <DatabaseError dbStatus={dbStatus.status}></DatabaseError>
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