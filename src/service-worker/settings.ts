import { StorageObject, StorageType, StorageListener } from "../storage/storage";

const ENABLED_KEY = 'enabled';

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
    const storage = new StorageObject<boolean>(ENABLED_KEY, StorageType.Local);
    const onEnabledChanged = new StorageListener(storage, (_, newValue) => toggleExtensionIcon(newValue));
    storage.addOnChangedListener(onEnabledChanged);
    storage.get().then(value => {
        if (value !== undefined) {
            toggleExtensionIcon(value);
        }
    });
}