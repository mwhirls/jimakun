import React from 'react';
import CheckContained from '../../../public/assets/check-contained.svg';

function DatabaseReady() {
    return (
        <div className='flex flex-col justify-center items-center m-auto gap-4 w-[26rem] max-w-full max-h-full p-8 mt-8'>
            <div>
                <div className='font-bold text-4xl mb-4 text-center'>Ready!</div>
                <div className='w-4/5 mx-auto'>
                    <CheckContained className='w-full h-full [&>path]:stroke-green-500'></CheckContained>
                </div>
            </div>
            <div className='w-4/5 text-2xl font-light text-center text-slate-400 w-11/12'>Jimakun has successfully updated. You may need to refresh Netflix for changes to take effect.</div>
        </div>
    )
}

export default DatabaseReady;