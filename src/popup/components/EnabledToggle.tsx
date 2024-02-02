import React, { useEffect } from 'react';
import Toggle from '../../common/components/Toggle';
import { StorageListener, StorageObject, StorageType } from '../../storage/storage';

const ENABLED_KEY = 'enabled';

export interface EnabledToggleProps {
    enabled: boolean;
    onSetEnabled: (enabled: boolean) => void;
    className?: string;
}

function EnabledToggle({ enabled, onSetEnabled, className }: EnabledToggleProps) {
    useEffect(() => {
        const storage = new StorageObject<boolean>(ENABLED_KEY, StorageType.Local);
        const onEnabledChanged = new StorageListener(storage, (_, newValue) => onSetEnabled(newValue));
        storage.addOnChangedListener(onEnabledChanged);
        storage.get().then(value => {
            if (value !== undefined) {
                onSetEnabled(value);
            }
        });

        return () => {
            storage.removeOnChangedListener(onEnabledChanged);
        }
    }, []);

    const onToggleEnabled = (value: boolean) => {
        const storage = new StorageObject<boolean>(ENABLED_KEY, StorageType.Local);
        storage.set(value);
        onSetEnabled(value);
    };

    return (
        <Toggle toggled={enabled !== null ? enabled : false} onToggle={onToggleEnabled} className={className}></Toggle>
    )
}

export default EnabledToggle;