import React from 'react';
import { Cog8ToothIcon } from '@heroicons/react/24/outline'

function openOptions() {
    chrome.runtime.openOptionsPage(() => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
            console.error(lastError);
        }
    });
}

function OptionsButton() {
    return (
        <button className="text-black text-2xl font-medium p-4 bg-white rounded-lg border border-solid border-gray-200 hover:border-gray-300 hover:drop-shadow-md active:bg-gray-200" onClick={() => openOptions()}>
            <span className="w-10 inline-block align-middle mr-4">
                <Cog8ToothIcon className="text-slate-400"></Cog8ToothIcon>
            </span>
            <span className="inline-block">Options</span>
        </button>
    )
}

export default OptionsButton;