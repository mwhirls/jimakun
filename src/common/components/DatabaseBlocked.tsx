import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

function DatabaseBlocked() {
    return (
        <div className='flex flex-col justify-center items-center m-auto gap-4 w-[26rem] max-w-full max-h-full py-6'>
            <div>
                <div className='font-bold text-4xl mb-4 text-center'>Warning!</div>
                <div className='w-4/5 mx-auto'>
                    <ExclamationTriangleIcon className='text-yellow-500'></ExclamationTriangleIcon>
                </div>
            </div>
            <div className='w-4/5 text-2xl font-light text-center text-slate-500 w-11/12'>{`It looks like you're still using an old version of Jimakun in another tab. Please close any other tabs using Netflix to allow Jimakun to finish upgrading.`}</div>
        </div>
    )
}

export default DatabaseBlocked;