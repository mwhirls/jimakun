import { useState, useEffect } from 'react'
import './App.css'

import { WEBVTT_FORMAT, TRACK_ELEM_ID } from "../util/util"
import { SubtitleTrack, SubtitleData } from "../util/netflix-types";
import { RuntimeEvent, MovieChangedMessage } from '../../util/events';

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

async function onCueChange(e: Event) {
    const track = e.target as TextTrack;
    if (!track || !track.activeCues) {
        return;
    }
    for (let i = 0; i < track.activeCues.length; i++) {
        const cue = track.activeCues[i] as any; // cue.text is not documented
        const tagsRegex = '(<([^>]+>)|&lrm;|&rlm;)';
        const regex = new RegExp(tagsRegex, 'ig');
        const match = regex.exec(cue.text);
        let cueText = cue.text;
        if (match) {
            cueText = cue.text.replace(regex, '');
        }
        console.log(cueText);
    }
}

// Add a ghost subtitle track to the Netflix video player so we can listen
// for subtitle queue changes
function addSubtitleTrack(subtitlesURL: string) {
    let videoElem = document.querySelector("video");
    if (!videoElem || document.getElementById(TRACK_ELEM_ID)) {
        return;
    }
    const trackElem = document.createElement('track');
    trackElem.id = TRACK_ELEM_ID;
    trackElem.label = 'Japanese';
    trackElem.src = subtitlesURL;
    trackElem.kind = 'subtitles';
    trackElem.default = true;
    trackElem.srclang = 'ja';
    videoElem.appendChild(trackElem);
    videoElem.textTracks[0].mode = 'hidden';
    videoElem.textTracks[0].addEventListener('cuechange', onCueChange, false);
}

function App() {
    const [moviesToSubtitles, setMoviesToSubtitles] = useState(new Map<string, string>);
    const [currMovie, setCurrMovie] = useState("");
    const [videoLoaded, setVideoLoaded] = useState(false);

    useEffect(() => {
        const subtitleListener = async (event: Event) => {
            const data = (event as CustomEvent).detail as SubtitleData;
            try {
                const subtitlesURL = await downloadSubtitles(data);
                setMoviesToSubtitles(prev => new Map([...prev, [data.movieId.toString(), subtitlesURL]]));
            } catch (error) {
                console.error('[JIMAKUN] Failed to fetch WebVTT file', error);
            }
        }
        const runtimeListener = (message: MovieChangedMessage) => {
            if (message.event === RuntimeEvent.MovieUpdated) {
                setCurrMovie(message.movieId);
            }
        };
        window.addEventListener(RuntimeEvent.SubtitlesDetected, subtitleListener);
        chrome.runtime.onMessage.addListener(runtimeListener);

        // We insert our components into the Netflix DOM, but they constantly
        // mutate it.  Watch for changes so we know when to re-render.
        const netflixObserver = new MutationObserver(mutationCallback);
        function mutationCallback(mutationsList: MutationRecord[], observer: MutationObserver) {
            for (let mutation of mutationsList) {
                if (mutation.type != 'childList' || !mutation.addedNodes) {
                    continue;
                }
                const hasVideo = document.getElementsByTagName("video").length > 0;
                setVideoLoaded(hasVideo);
            }
        }
        const config = { attributes: false, childList: true, subtree: true };
        netflixObserver.observe(document.body, config);

        return () => {
            window.removeEventListener(RuntimeEvent.SubtitlesDetected, subtitleListener);
            chrome.runtime.onMessage.removeListener(runtimeListener);
            netflixObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!currMovie.length || !videoLoaded) {
            return;
        }
        const subtitles = moviesToSubtitles.get(currMovie);
        if (subtitles) {
            addSubtitleTrack(subtitles);
        }
    }, [moviesToSubtitles, currMovie, videoLoaded]);

    return (
        <>
        </>
    )
}

export default App