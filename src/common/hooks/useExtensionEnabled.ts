import { StorageType } from "../../storage/storage";
import { useStorage } from "./useStorage";

const ENABLED_KEY = 'enabled';

export function useExtensionEnabled(defaultValue: boolean): [boolean, (newValue: boolean) => void] {
    const [enabled, setEnabled] = useStorage<boolean>(ENABLED_KEY, StorageType.Local, defaultValue);
    return [enabled, setEnabled];
}