import './popup.css'
import React from "react";
import ReactDOM from 'react-dom/client';
import DatabaseBlocked from "../common/components/DatabaseBlocked";
import DatabaseBusy from "../common/components/DatabaseBusy";
import DatabaseError from "../common/components/DatabaseError";
import Popup from "./components/Popup";
import { DBStatusResult, Status } from '../database/dbstatus';
import { StorageType } from '../storage/storage';
import AppLogo from '../common/components/AppLogo';
import OptionsButton from '../common/components/OptionsButton';
import { useStorage } from '../common/hooks/useStorage';

const DB_STATUS_KEY = 'lastDBStatusResult'

function PopupContainer() {
    const [dbStatus] = useStorage<DBStatusResult | null>(DB_STATUS_KEY, StorageType.Local, null);

    if (!dbStatus) {
        return <></>;
    }

    const content = () => {
        switch (dbStatus.status.type) {
            case Status.Ready:
                return <Popup></Popup>
            case Status.Blocked:
                return <DatabaseBlocked></DatabaseBlocked>
            case Status.Busy:
                return <DatabaseBusy dbStatus={dbStatus.status}></DatabaseBusy>
            case Status.ErrorOccurred:
                return <DatabaseError></DatabaseError>
        }
    }

    return (
        <div className="bg-white rounded-lg text-black min-w-[24rem] min-h-fit">
            <div className='p-4 bg-white border-b border-solid border-slate-200 flex flex-row justify-between items-center'>
                <AppLogo className='ml-4 text-2xl h-12'></AppLogo>
                <OptionsButton className='w-10 h-10'></OptionsButton>
            </div>
            <div className='px-4 pb-4'>
                {content()}
            </div>
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
        <PopupContainer></PopupContainer>
    </React.StrictMode>
);