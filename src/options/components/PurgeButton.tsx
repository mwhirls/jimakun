import React, { useState } from "react";
import { DBStatusResult, Status } from "../../service-worker/database/dbstatus";
import Spinner from "../../common/components/Spinner";
import { RuntimeMessage, RuntimeEvent } from "../../common/events";
import Modal from "../../common/components/modal/Modal";
import { AlertType } from "../../common/components/modal/Alert";
import { useStorage } from "../../common/hooks/useStorage";
import { StorageType } from "../../storage/storage";

const DB_STATUS_KEY = 'lastDBStatusResult'

async function purgeDictionaries(): Promise<number> {
    const message: RuntimeMessage = { event: RuntimeEvent.PurgeDictionaries, data: undefined };
    return chrome.runtime.sendMessage(message);
}

function PurgeButton() {
    const [dbStatus] = useStorage<DBStatusResult | null>(DB_STATUS_KEY, StorageType.Local, null);
    const [showAlert, setShowAlert] = useState(false);
    const [purging, setPurging] = useState(false);

    const onPurgeClicked = () => {
        setShowAlert(true);
    };

    const onPurgeConfirmed = async () => {
        setShowAlert(false);
        setPurging(true);
        await purgeDictionaries();
        setPurging(false);
    }

    const disabled = !dbStatus || dbStatus.status.type == Status.Busy;
    const content = () => {
        switch (dbStatus?.status.type) {
            case Status.Busy: {
                const text = purging ? "Purging..." : "Please wait...";
                return (
                    <>
                        <span className="w-8 inline-block align-middle mr-4">
                            <Spinner color='white' thickness={3}></Spinner>
                        </span>
                        <span className="inline-block">{text}</span>
                    </>
                )
            }
            default:
                return <span className="px-4">Purge</span>
        }
    }

    const alertButtons = {
        type: AlertType.AlertConfirmCancel,
        buttonText: "Purge",
        onCancel: () => setShowAlert(false),
        onConfirm: () => onPurgeConfirmed(),
    };
    return (
        <>
            <button className="text-white text-2xl font-semibold py-4 px-8  bg-red-600 rounded-md hover:drop-shadow-md active:bg-red-700 disabled:opacity-75 disabled:bg-slate-400" disabled={disabled} onClick={() => onPurgeClicked()}>
                {content()}
            </button>
            <Modal open={showAlert} headerText={"Purge Dictionaries"} bodyText={"Are you sure you want to delete and reimport the dictionaries? This operation may take a few minutes."} buttons={alertButtons} scale={2.0}></Modal>
        </>
    )
}

export default PurgeButton;