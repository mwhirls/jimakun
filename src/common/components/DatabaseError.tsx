import React from 'react';
import { ErrorOccurred } from '../../database/dbstatus';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import OptionsButton from './OptionsButton';

interface DatabaseErrorProps {
    dbStatus: ErrorOccurred;
}

function DatabaseError({ dbStatus }: DatabaseErrorProps) {
    return (
        <div className='flex flex-col justify-center items-center m-auto gap-4 w-[26rem] max-w-full max-h-full p-8 mt-8'>
            <div>
                <div className='font-bold text-4xl mb-4 text-center'>Ready!</div>
                <div className='w-4/5 mx-auto'>
                    <ExclamationTriangleIcon className='text-red-600'></ExclamationTriangleIcon>
                </div>
            </div>
            <div className='w-4/5 text-2xl font-light text-center text-slate-400 w-11/12'>{`The following error occurred while updating Jimakun's dictionaries. Navigate to Options > Purge Dictionaries to attempt a reimport.`}</div>
            <div>{dbStatus.message}</div>
            <OptionsButton></OptionsButton>
        </div>
    )
}

export default DatabaseError;