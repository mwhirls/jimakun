import React from 'react';

const FAVORITE_ICON = 'assets/favourite.svg';
const DOWNLOAD_ICON = 'assets/file-down-01.svg';

function Footer() {
    const favoriteIconUrl = chrome.runtime.getURL(FAVORITE_ICON);
    const downloadIconUrl = chrome.runtime.getURL(DOWNLOAD_ICON);
    return (
        <>
            <hr></hr>
            <div className="flex justify-between">
                <button>
                    <img src={favoriteIconUrl}></img>
                </button>
                <button>
                    <img src={downloadIconUrl}></img>
                </button>
            </div>
        </>
    );
}
export default Footer;