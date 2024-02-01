import React from "react";
import AppLogo from "../../common/components/AppLogo";
import PurgeButton from "./PurgeButton";

function Settings() {
    return (
        <>
            <div className="border-b border-solid rounded-b-md bg-white p-4 drop-shadow">
                <AppLogo className="w-4/5 max-w-[175rem] my-4 mx-auto text-3xl h-16"></AppLogo>
            </div>
            <div className="w-4/5 max-w-[175rem] mx-auto my-8 flex flex-col gap-4">
                <h1 className="text-5xl font-bold">Settings</h1>
                <hr></hr>
                <div className="grid grid-cols-2 gap-8 divide-y mt-8 items-center">
                    <div>
                        <h3 className="text-4xl font-bold">Purge Dictionaries</h3>
                        <p className="text-2xl text-slate-400 mt-2">Forcefully purge all dictionary databases and attempt to reimport dictionaries. This can be used to reset the state of the backend in the event that Jimakun encounters an error during upgrade.</p>
                    </div>
                    <div className="justify-self-end">
                        <PurgeButton></PurgeButton>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Settings;