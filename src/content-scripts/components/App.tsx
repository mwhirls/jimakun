import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom';
import { WebvttSubtitles } from './Video'
import Video from './Video'

import { ChildMutationType, WEBVTT_FORMAT, querySelectorMutation } from "../util/util"
import { TimedTextTrack, NetflixMetadata, TimedTextSwitch } from "../../util/netflix-types";
import { RuntimeEvent } from '../../util/events';
import { SegmenterContext } from '../contexts/SegmenterContext';
import { Segmenter, build } from 'bunsetsu';
import { SessionStorageChangedListener, SessionStorageObject } from '../../storage/sesson-storage';

const NETFLIX_PLAYER_CLASS = "watch-video--player-view";
const NETFLIX_VIDEO_CLASS = `${NETFLIX_PLAYER_CLASS} video`
const MOVIE_KEY = 'lastMovieId';

type MovieId = number;
type SubtitleTracks = Map<string, SubtitleData>;

class SubtitleData implements WebvttSubtitles {
    webvttUrl: string;
    bcp47: string;

    constructor(webvttUrl: string, bcp47: string) {
        this.webvttUrl = webvttUrl;
        this.bcp47 = bcp47;
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
    return new SubtitleData(blobUrl, track.language);
}

function App() {
    const [subtitleData, setSubtitleData] = useState(new Map<MovieId, SubtitleTracks>);
    const [currMovie, setCurrMovie] = useState<MovieId | null>(null);
    const [currTrack, setCurrTrack] = useState("");
    const [netflixPlayer, setNetflixPlayer] = useState<Element | null>(document.querySelector(`.${NETFLIX_PLAYER_CLASS}`));
    const [videoElem, setVideoElem] = useState<HTMLVideoElement | null>(document.querySelector(`.${NETFLIX_VIDEO_CLASS}`) as HTMLVideoElement | null);
    const [segmenter, setSegmenter] = useState<Segmenter | null>(null);

    useEffect(() => {
        const metadataListener = async (event: Event) => {
            const metadata = (event as CustomEvent).detail as NetflixMetadata;
            const movieId = metadata.movieId;
            for (const track of metadata.timedtexttracks) {
                try {
                    const subtitles = await downloadSubtitles(track);
                    if (subtitles) {
                        setSubtitleData(prev => {
                            const previousTracks = prev.get(movieId) ?? [];
                            const tracks = new Map([...previousTracks, [track.new_track_id, subtitles]]);
                            return new Map([...prev, [movieId, tracks]])
                        });
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
        window.addEventListener(RuntimeEvent.MetadataDetected, metadataListener);
        window.addEventListener(RuntimeEvent.SubtitleTrackSwitched, trackSwitchedListener);

        const storage = new SessionStorageObject<MovieId>(MOVIE_KEY);
        const onMovieIdChanged = SessionStorageChangedListener.create(storage, (_, newValue) => setCurrMovie(newValue));
        storage.get().then(movieId => setCurrMovie(movieId));
        storage.addOnChangedListener(onMovieIdChanged);

        // We insert our components into the Netflix DOM, but they constantly
        // mutate it.  Watch for changes so we know when to re-render.
        const netflixObserver = new MutationObserver(mutationCallback);
        function mutationCallback(mutationsList: MutationRecord[]) {
            for (const mutation of mutationsList) {
                if (mutation.type !== 'childList') {
                    continue;
                }
                const video = querySelectorMutation(mutation, `.${NETFLIX_VIDEO_CLASS}`);
                if (video) {
                    setVideoElem(video.type === ChildMutationType.Added ? video.elem as HTMLVideoElement : null);
                    const player = document.querySelector(`.${NETFLIX_PLAYER_CLASS}`);
                    setNetflixPlayer(player);
                }
            }
        }
        const config = { attributes: false, childList: true, subtree: true };
        netflixObserver.observe(document.body, config);
        build(chrome.runtime.getURL("dict/"))
            .then((segmenter) => setSegmenter(segmenter))
            .catch((err) => console.error('[JIMAKUN] error when building tokenizer', err));

        return () => {
            window.removeEventListener(RuntimeEvent.MetadataDetected, metadataListener);
            window.removeEventListener(RuntimeEvent.MetadataDetected, trackSwitchedListener);
            storage.removeOnChangedListener(onMovieIdChanged);
            netflixObserver.disconnect();
        };
    }, []);

    if (!currMovie) {
        return <></>;
    }
    const subtitleTracks = subtitleData.get(currMovie);
    const subtitles = subtitleTracks?.get(currTrack);
    if (!netflixPlayer || !videoElem || !subtitles) {
        return <></>;
    }

    // Appending to the Netflix player element since its layout is fairly stable and consistent,
    // and doesn't typically cause issues with blocking input, etc
    return (
        <>

            {createPortal(
                <SegmenterContext.Provider value={{ segmenter }}>
                    <Video webvttSubtitles={subtitles} videoElem={videoElem}></Video>
                </SegmenterContext.Provider>,
                netflixPlayer
            )}

        </>
    )
}

export default App