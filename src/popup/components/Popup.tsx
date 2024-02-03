import React from 'react';
import { StorageType } from '../../storage/storage';
import Toggle from '../../common/components/Toggle';
import { useStorage } from '../../common/hooks/useStorage';

const ENABLED_KEY = 'enabled';

function Popup() {
    const [enabled, setEnabled] = useStorage<boolean>(ENABLED_KEY, StorageType.Local, false);

    const textColor = enabled ? "text-slate-800" : "text-slate-400";
    return (
        <div className='flex flex-col justify-center m-auto gap-4 max-w-full max-h-full p-4'>
            <div className='flex flex-row justify-between items-center gap-16 w-full'>
                <span className={`text-2xl p-4 font-semibold ${textColor}`}>Enabled</span>
                <Toggle toggled={enabled} onToggle={value => setEnabled(value)} className='scale-125 w-fit h-fit'></Toggle>
            </div>
        </div>
    )
}

export default Popup;