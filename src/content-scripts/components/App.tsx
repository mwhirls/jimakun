import { useState, useEffect } from 'react'
import './App.css'
import Video from './Video'

import { WEBVTT_FORMAT } from "../util/util"
import { TimedTextTrack, NetflixMetadata, RecommendedMedia, TimedTextSwitch } from "../../util/netflix-types";
import { RuntimeEvent, MovieChangedMessage } from '../../util/events';

class MovieMetadata implements NetflixMetadata {
    movieId: number;
    recommendedMedia: RecommendedMedia;
    timedtexttracks: Array<TimedTextTrack>;

    constructor(movieId: number, recommendedMedia: RecommendedMedia, timedtexttracks: Array<TimedTextTrack>) {
        this.movieId = movieId;
        this.recommendedMedia = recommendedMedia;
        this.timedtexttracks = timedtexttracks;
    }
}

class SubtitleData {
    webvttUrl: string;

    constructor(webvttUrl: string) {
        this.webvttUrl = webvttUrl;
    }
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

async function downloadSubtitles(track: TimedTextTrack): Promise<SubtitleData | null> {
    if (track.language !== 'ja' || track.languageDescription !== 'Japanese') {
        return null;
    }
    const downloadable = track.ttDownloadables[WEBVTT_FORMAT];
    const url = downloadable?.urls.length ? downloadable.urls[0].url : null;
    if (!url) {
        console.warn(`[JIMAKUN] Failed to find a suitable subtitle URL for track ${track.new_track_id}`);
        return null;
    }
    const blobUrl = await fetchSubtitlesBlob(url);
    return { webvttUrl: blobUrl };
}

function App() {
    const [moviesMetadata, setMoviesMetadata] = useState(new Map<string, MovieMetadata>);
    const [subtitleData, setSubtitleData] = useState(new Map<string, SubtitleData>);
    const [currMovie, setCurrMovie] = useState("");
    const [currTrack, setCurrTrack] = useState("");
    const [videoLoaded, setVideoLoaded] = useState(false);

    useEffect(() => {
        const metadataListener = async (event: Event) => {
            const data = (event as CustomEvent).detail as NetflixMetadata;
            const metadata = new MovieMetadata(data.movieId, data.recommendedMedia, data.timedtexttracks);
            setMoviesMetadata(prev => new Map([...prev, [metadata.movieId.toString(), metadata]]));
            for (const track of metadata.timedtexttracks) {
                try {
                    const subtitles = await downloadSubtitles(track);
                    if (subtitles) {
                        setSubtitleData(prev => new Map([...prev, [track.new_track_id, subtitles]]));
                    }
                } catch (error) {
                    console.error('[JIMAKUN] Failed to fetch WebVTT file', error);
                }
            }
            setCurrTrack(metadata.recommendedMedia.timedTextTrackId);
        };
        const trackSwitchedListener = async (event: Event) => {
            const data = (event as CustomEvent).detail as TimedTextSwitch;
            setCurrTrack(data.track.trackId);
        };
        const runtimeListener = (message: MovieChangedMessage) => {
            if (message.event === RuntimeEvent.MovieUpdated) {
                setCurrMovie(message.movieId);
            }
        };
        window.addEventListener(RuntimeEvent.MetadataDetected, metadataListener);
        window.addEventListener(RuntimeEvent.SubtitleTrackSwitched, trackSwitchedListener);
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
            window.removeEventListener(RuntimeEvent.MetadataDetected, metadataListener);
            chrome.runtime.onMessage.removeListener(runtimeListener);
            chrome.runtime.onMessage.removeListener(trackSwitchedListener);
            netflixObserver.disconnect();
        };
    }, []);

    const webvttUrl = subtitleData.get(currTrack)?.webvttUrl;
    const showVideo = videoLoaded && currMovie && webvttUrl;
    if (showVideo) {
        return (
            <>
                <Video subtitlesURL={webvttUrl}></Video>
            </>
        )
    } else {
        return (<></>);
    }
}

export default App