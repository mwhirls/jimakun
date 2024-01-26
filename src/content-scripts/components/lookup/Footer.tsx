import React from 'react';
import { Cog8ToothIcon } from '@heroicons/react/24/outline'

function Footer() {
    return (
        <div className='flex-none'>
            <hr></hr>
            <button className='mt-3 w-12 float-right'>
                <Cog8ToothIcon className='text-slate-400 hover:text-black'></Cog8ToothIcon>
            </button>
        </div>
    );
}
export default Footer;