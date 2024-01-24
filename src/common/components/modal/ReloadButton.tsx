import React from 'react';
import ArrowRotateRight from '../../../../public/assets/arrow-rotate-right-01.svg'

function reloadPage() {
    if (chrome.tabs) {
        chrome.tabs.reload();
    } else {
        window.location.reload();
    }
}

export interface ReloadButtonProps {
    className: string;
}

const ReloadButton = React.forwardRef((props: ReloadButtonProps, ref: React.ForwardedRef<HTMLButtonElement>) => {
    return (
        <button ref={ref} className={`text-white text-base font-semibold p-2 bg-red-600 rounded-lg hover:drop-shadow-md active:bg-red-800 ${props.className}`} onClick={() => reloadPage()}>
            <span className="w-4 inline-block align-middle mr-2 aspect-square">
                <ArrowRotateRight className="[&>path]:stroke-white w-full h-full"></ArrowRotateRight>
            </span>
            <span className="inline-block">Reload</span>
        </button>
    )
});
ReloadButton.displayName = "ReloadButton";

export default ReloadButton;