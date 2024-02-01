import React, { useState } from 'react';
import EnabledToggle from './EnabledToggle';

function Popup() {
    const [enabled, setEnabled] = useState<boolean | null>(null);

    const textColor = enabled ? "text-slate-800" : "text-slate-400";
    return (
        <div className='flex flex-col justify-center m-auto gap-4 max-w-full max-h-full p-4'>
            <div className='flex flex-row justify-between items-center gap-16 w-full'>
                <span className={`text-2xl p-4 font-semibold ${textColor}`}>Enabled</span>
                <EnabledToggle enabled={enabled !== null ? enabled : false} onSetEnabled={(enabled) => setEnabled(enabled)} className='scale-125 w-fit h-fit'></EnabledToggle>
            </div>
        </div>
    )
}

export default Popup;