import React from 'react';
import FavoriteIcon from '../../../../public/assets/favourite.svg';
import DownloadIcon from '../../../../public/assets/file-down-01.svg';

function Footer() {
    return (
        <div className='flex-none'>
            <hr></hr>
            <div className="flex justify-between mt-3">
                <button>
                    <FavoriteIcon></FavoriteIcon>
                </button>
                <button>
                    <DownloadIcon></DownloadIcon>
                </button>
            </div>
        </div>
    );
}
export default Footer;