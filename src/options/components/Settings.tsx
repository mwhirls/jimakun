import React, { useState } from "react";
import Header from './Header'
import PurgeButton from "./PurgeButton";
import { RuntimeMessage, RuntimeEvent } from "../../common/events";
import Alert from "./Alert";

async function purgeDictionaries(): Promise<number> {
    const message: RuntimeMessage = { event: RuntimeEvent.PurgeDictionaries, data: undefined };
    return chrome.runtime.sendMessage(message);
}

function Settings() {
    const [showAlert, setShowAlert] = useState(false);

    const onPurgeClicked = () => {
        setShowAlert(true);
    };

    return (
        <>
            <Header></Header>
            <div className="w-3/5 mx-auto my-8 flex flex-col gap-4">
                <h1 className="text-5xl font-bold">Settings</h1>
                <hr></hr>
                <div className="grid grid-cols-2 gap-8 divide-y mt-8 items-center">
                    <div>
                        <h3 className="text-4xl font-bold">Purge Dictionaries</h3>
                        <p className="text-2xl text-slate-400 mt-2">Forcefully purge all dictionary databases and attempt to reimport dictionaries. This can be used to reset the state of the backend in the event that Jimakun encounters an error during upgrade.</p>
                    </div>
                    <div className="justify-self-end">
                        <PurgeButton onClick={onPurgeClicked}></PurgeButton>
                    </div>
                </div>
            </div>
            <Alert open={showAlert} setOpen={(show) => setShowAlert(show)} headerText={"Purge Dictionaries"} bodyText={"Are you sure you want to delete and reimport the dictionaries? This operation may take a few minutes."} buttonText={"Purge"} scale={2.0}></Alert>
        </>
    )
}

export default Settings;