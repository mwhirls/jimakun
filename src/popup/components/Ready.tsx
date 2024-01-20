import React from 'react';

function DatabaseReady() {
    return (
        <div className='flex flex-col justify-center items-center m-auto gap-4 max-w-full w-[16rem] max-h-full'>
            <div>
                <div className='font-bold text-xl mb-4 text-center text-green-500'>Ready!</div>
                <img className='w-4/5 mx-auto' src='assets/check-contained.svg'></img>
            </div>
            <div className='text-base font-light text-center text-slate-400 w-11/12'>Jimakun has successfully updated</div>
        </div>
    )
}

export default DatabaseReady;