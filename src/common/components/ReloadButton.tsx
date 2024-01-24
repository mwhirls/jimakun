import React from 'react';
import ArrowRotateRight from '../../../public/assets/arrow-rotate-right-01.svg'

function reloadPage() {
    chrome.tabs.reload();
}

function ReloadButton() {
    return (
        <button className="text-black text-2xl font-medium p-4 bg-white rounded-lg border border-solid border-gray-200 hover:border-gray-300 hover:drop-shadow-md active:bg-gray-200" onClick={() => reloadPage()}>
            <span className="w-10 inline-block align-middle mr-4">
                <ArrowRotateRight className="text-slate-400"></ArrowRotateRight>
            </span>
            <span className="inline-block">Options</span>
        </button>
    )
}

export default ReloadButton;