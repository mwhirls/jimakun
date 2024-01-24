
import { createContext } from 'react';

type OnInvalidatedCallback = () => void;

export class ExtensionContext {
    private onInvalidatedCB: OnInvalidatedCallback | null;

    constructor(cb: OnInvalidatedCallback | null) {
        this.onInvalidatedCB = cb;
    }

    onInvalidated() {
        if (this.onInvalidatedCB) {
            this.onInvalidatedCB();
        }
    }
}

export const ChromeExtensionContext = createContext<ExtensionContext>(new ExtensionContext(null));