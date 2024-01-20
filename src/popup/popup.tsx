import { createRoot } from 'react-dom/client';
import React, { useEffect, useState } from "react";
import DatabaseBlocked from "../common/components/DatabaseBlocked";
import DatabaseBusy from "../common/components/DatabaseBusy";
import DatabaseError from "../common/components/DatabaseError";
import { DBStatusResult, RuntimeMessage, RuntimeEvent, Status } from "../common/events";
import * as DBStatusNotifier from '../dbstatus-notifier';

function Popup() {
    const [dbStatus, setDBStatus] = useState<DBStatusResult | null>(null);

    useEffect(() => {
        const runtimeListener = (message: RuntimeMessage) => {
            if (message.event === RuntimeEvent.ReportDBStatus) {
                const result = message.data as DBStatusResult; // TODO: validate
                setDBStatus(result);
            }
        };
        chrome.runtime.onMessage.addListener(runtimeListener);
        DBStatusNotifier.getDBStatus().then(result => setDBStatus(result));

        return () => {
            chrome.runtime.onMessage.removeListener(runtimeListener);
        }
    }, []);

    if (!dbStatus) {
        return <></>;
    }

    const content = () => {
        switch (dbStatus.status.type) {
            case Status.Ready:
                return <>Ready!</>; // todo
            case Status.Blocked:
                return <DatabaseBlocked dbStatus={dbStatus.status}></DatabaseBlocked>
            case Status.Busy:
                return <DatabaseBusy dbStatus={dbStatus.status}></DatabaseBusy>
            case Status.ErrorOccurred:
                return <DatabaseError dbStatus={dbStatus.status}></DatabaseError>
        }
    }

    return (
        <div className="bg-white rounded-lg text-black min-w-fit max-w-[40vw] min-h-fit max-h-[60vh] px-12 py-6">
            {content()}
        </div>
    );
}

createRoot(document.createElement("div")).render(
    <React.StrictMode>
        <Popup></Popup>
    </React.StrictMode>
);