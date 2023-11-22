import { useState, useEffect } from 'react'
import './App.css'

import { WEBVTT_FORMAT } from "../util/util"
import { SubtitleTrack, SubtitleData } from "../util/netflix-types";
import { RuntimeMessage } from '../../util/events';

function findBestSubtitleURL(track: SubtitleTrack) {
    const webvttDL = track.ttDownloadables[WEBVTT_FORMAT];
    if (!webvttDL) {
        return null;
    }
    return webvttDL.urls.length ? webvttDL.urls[0].url : null;
}

async function fetchSubtitlesBlob(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Bad response to request at ${url}`);
    }
    const blob = await response.blob();
    const webvttBlob = new Blob([blob], { type: 'text/vtt' });
    return URL.createObjectURL(await webvttBlob);
}

async function downloadSubtitles(data: SubtitleData) {
    const timedtexttracks = data.timedtexttracks;

    for (let track of timedtexttracks) {
        if (track.language !== 'ja' || track.languageDescription !== 'Japanese') {
            continue;
        }
        const bestUrl = findBestSubtitleURL(track);
        if (!bestUrl) {
            console.warn(`[JIMAKUN] Failed to find a suitable subtitle URL for movie ${data.movieId}`);
            continue;
        }
        return await fetchSubtitlesBlob(bestUrl);
    }
    throw new Error("[JIMAKUN] No Japanese subtitles found");
}

function App() {
    const [moviesToSubtitles, setMoviesToSubtitles] = useState(new Map<string, string>);

    useEffect(() => {
        const subtitleListener = async (event: Event) => {
            const data = (event as CustomEvent).detail as SubtitleData;
            try {
                const subtitlesURL = await downloadSubtitles(data);
                setMoviesToSubtitles(prev => new Map([...prev, [data.movieId, subtitlesURL]]));
            } catch (error) {
                console.error('[JIMAKUN] Failed to fetch WebVTT file', error);
            }
        }
        window.addEventListener(RuntimeMessage.SubtitlesDetected, subtitleListener);

        return () => {
            window.removeEventListener(RuntimeMessage.SubtitlesDetected, subtitleListener);
        };
    }, []);



    return (
        <>
        </>
    )
}

export default App