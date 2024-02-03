import { Segmenter, build } from "bunsetsu";
import React, { useState, useEffect } from "react";
import { StorageType } from "../../storage/storage";
import { ExtensionContext, ChromeExtensionContext } from "../contexts/ExtensionContext";
import { SegmenterContext } from "../contexts/SegmenterContext";
import { AlertType } from "../../common/components/modal/Alert";
import Modal from "../../common/components/modal/Modal";
import { DBStatusResult } from "../../database/dbstatus";
import VideoContainer from "./VideoContainer";
import { useStorage } from "../../common/hooks/useStorage";

const DB_STATUS_KEY = 'lastDBStatusResult';
const KUROMOJI_DICTIONARIES = 'dict/';

function App() {
    const [invalidated, setInvalidated] = useState(false);
    const [dbStatus] = useStorage<DBStatusResult | null>(DB_STATUS_KEY, StorageType.Local, null);
    const [segmenter, setSegmenter] = useState<Segmenter | null>(null);

    const context = new ExtensionContext(() => setInvalidated(true));

    useEffect(() => {
        build(chrome.runtime.getURL(KUROMOJI_DICTIONARIES))
            .then((segmenter) => setSegmenter(segmenter))
            .catch((err) => console.error('[JIMAKUN] error when building tokenizer', err));
    }, []);

    if (invalidated) {
        return (
            <Modal open={invalidated} headerText={"Extension Updated"} bodyText={"It looks like Jimakun was updated or reinstalled from another tab. Please reload the page for changes to take effect."} buttons={{ type: AlertType.AlertReload }} scale={2.0}></Modal>
        )
    }

    return (
        <SegmenterContext.Provider value={{ segmenter }}>
            <ChromeExtensionContext.Provider value={context}>
                <VideoContainer dbStatus={dbStatus}></VideoContainer>
            </ChromeExtensionContext.Provider>
        </SegmenterContext.Provider>
    )
}

export default App