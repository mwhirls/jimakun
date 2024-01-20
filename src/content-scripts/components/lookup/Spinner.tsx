import React from "react";

const SPINNER_ICON_URL = 'assets/spinner.svg';

function Spinner() {
    const spinnerIcon = chrome.runtime.getURL(SPINNER_ICON_URL);

    return (
        <img src={spinnerIcon} className="animate-spin"></img>
    );
}
export default Spinner;