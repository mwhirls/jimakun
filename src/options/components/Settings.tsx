import React from "react";
import Header from './Header'

function Settings() {
    return (
        <>
            <Header></Header>
            <div className="w-4/5 mx-auto my-8 flex flex-col gap-4">
                <h1 className="text-6xl font-bold">Settings</h1>
                <hr></hr>
                <div className="grid grid-cols-2 gap-8 divide-y mt-8 items-center">
                    <div>
                        <h3 className="text-4xl font-bold">Purge Dictionaries</h3>
                        <p className="text-2xl text-slate-400 mt-2">Forcefully purge all dictionary databases and attempt to reimport dictionaries. This can be used to reset the state of the backend in the event that Jimakun encounters an error during upgrade.</p>
                    </div>
                    <div className="justify-self-end">
                        <button className="text-red-600 text-3xl font-bold p-4 bg-slate-100 border border-solid border-slate-400 rounded-md hover:bg-red-600 hover:text-white">Purge</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Settings;