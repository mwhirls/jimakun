import { StorageObject, StorageType, StorageListener } from "../storage/storage";

const ENABLED_KEY = 'enabled';

function addLocalStorageListener<T>(settingKey: string, defaultValue: T, onChanged: (oldValue: T | undefined, newValue: T) => void) {
    const storage = new StorageObject<T>(settingKey, StorageType.Local);
    const listener = new StorageListener(storage, onChanged);
    storage.addOnChangedListener(listener);
    storage.get().then(value => {
        if (value === undefined) {
            storage.set(defaultValue);
        }
        const newValue = value === undefined ? defaultValue : value;
        onChanged(value, newValue);
    });
}

async function toggleExtensionIcon(enabled: boolean) {
    const icons = enabled ? {
        16: "icons/icon16.png",
        32: "icons/icon32.png",
        48: "icons/icon48.png",
        128: "icons/icon128.png",
    } : {
        16: "icons/icon16-inactive.png",
        32: "icons/icon32-inactive.png",
        48: "icons/icon48-inactive.png",
        128: "icons/icon128-inactive.png",
    };
    return chrome.action.setIcon({
        path: icons
    });
}

export function loadAppSettings() {
    addLocalStorageListener<boolean>(ENABLED_KEY, true, (_, newValue) => toggleExtensionIcon(newValue));
}