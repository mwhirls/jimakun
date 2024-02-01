import React, { useEffect, useState } from 'react';
import Toggle from '../../common/components/Toggle';
import { StorageListener, StorageObject, StorageType } from '../../storage/storage';

const ENABLED_KEY = 'enabled';

function Popup() {
    const [enabled, setEnabled] = useState<boolean | null>(null);

    useEffect(() => {
        const storage = new StorageObject<boolean>(ENABLED_KEY, StorageType.Local);
        const onEnabledChanged = new StorageListener(storage, (_, newValue) => setEnabled(newValue));
        storage.addOnChangedListener(onEnabledChanged);
        storage.get().then(status => {
            if (status) {
                setEnabled(status);
            }
        });

        return () => {
            storage.removeOnChangedListener(onEnabledChanged);
        }
    }, []);

    const onToggleEnabled = (value: boolean) => {
        const storage = new StorageObject<boolean>(ENABLED_KEY, StorageType.Local);
        storage.set(value);
    };

    const textColor = enabled ? "text-slate-800" : "text-slate-400";
    return (
        <div className='flex flex-col justify-center m-auto gap-4 max-w-full max-h-full p-4'>
            <div className='flex flex-row justify-between items-center gap-16 w-full'>
                <span className={`text-2xl p-4 font-semibold ${textColor}`}>Enabled</span>
                <Toggle toggled={enabled !== null ? enabled : false} onToggle={onToggleEnabled} className='scale-125 w-fit h-fit'></Toggle>
            </div>
        </div>
    )
}

export default Popup;