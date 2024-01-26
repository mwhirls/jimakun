import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import OptionsButton from './OptionsButton';

function DatabaseError() {
    return (
        <div className='flex flex-col justify-center items-center m-auto gap-4 w-[26rem] max-w-full max-h-full py-6'>
            <div>
                <div className='text-black font-bold text-4xl mb-4 text-center'>Error!</div>
                <div className='w-4/5 mx-auto'>
                    <ExclamationTriangleIcon className='text-red-600'></ExclamationTriangleIcon>
                </div>
            </div>
            <div className='w-4/5 text-2xl font-light text-center text-slate-500'>
                <span>{`An error occurred while updating Jimakun's dictionaries. Navigate to `}</span>
                <span className='font-medium'>{`Options > Purge Dictionaries `}</span>
                <span>{`to attempt a reimport.`}</span>
            </div>
            <OptionsButton></OptionsButton>
        </div>
    )
}

export default DatabaseError;