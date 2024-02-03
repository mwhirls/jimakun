import { useState, useContext, useEffect } from "react";
import { ChromeExtensionContext } from "../../content-scripts/contexts/ExtensionContext";
import { BrowserStorage, BrowserStorageListener } from "../../content-scripts/util/browser-runtime";
import { StorageType } from "../../storage/storage";

export function useStorage<T>(key: string, storageType: StorageType, defaultValue: T): [T, (newValue: T) => void] {
    const [value, setValue] = useState<T>(defaultValue);
    const context = useContext(ChromeExtensionContext);

    useEffect(() => {
        const storage = new BrowserStorage<T>(key, storageType, context);
        const onChanged = BrowserStorageListener.create(storage, (_, newValue) => setValue(newValue), context);
        if (onChanged) {
            storage.addOnChangedListener(onChanged);
        }
        storage.get().then(v => {
            if (v !== undefined) {
                setValue(v);
            }
        });

        return () => {
            if (onChanged) {
                storage.removeOnChangedListener(onChanged);
            }
        }
    }, []);

    const setStorageValue = (newValue: T) => {
        const storage = new BrowserStorage<T>(key, storageType, context);
        storage.set(newValue);
        setValue(newValue);
    };

    return [value, setStorageValue];
}