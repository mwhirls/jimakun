import { Segmenter, build } from "bunsetsu";
import React, { useState, useEffect, useContext } from "react";
import { createPortal } from "react-dom";
import { RuntimeEvent } from "../../common/events";
import { TimedTextTrack, NetflixMetadata, TimedTextSwitch } from "../../common/netflix-types";
import { StorageType } from "../../storage/storage";
import { ExtensionContext, ChromeExtensionContext } from "../contexts/ExtensionContext";
import { SegmenterContext } from "../contexts/SegmenterContext";
import { BrowserStorage, BrowserStorageListener } from "../util/browser-runtime";
import { WEBVTT_FORMAT, querySelectorMutation, ChildMutationType } from "../util/util";
import Video, { WebvttSubtitles } from "./Video";
import { AlertType } from "../../common/components/modal/Alert";
import Modal from "../../common/components/modal/Modal";
import { DBStatusResult } from "../../database/dbstatus";

const NETFLIX_PLAYER_CLASS = "watch-video--player-view";
const NETFLIX_VIDEO_CLASS = `${NETFLIX_PLAYER_CLASS} video`
const MOVIE_KEY = 'lastMovieId';
const DB_STATUS_KEY = 'lastDBStatusResult';

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
    const [invalidated, setInvalidated] = useState(false);
    const [dbStatus, setDBStatus] = useState<DBStatusResult | null>(null);
    const [subtitleData, setSubtitleData] = useState(new Map<MovieId, SubtitleTracks>);
    const [currMovie, setCurrMovie] = useState<MovieId | null>(null);
    const [currTrack, setCurrTrack] = useState("");
    const [netflixPlayer, setNetflixPlayer] = useState<Element | null>(document.querySelector(`.${NETFLIX_PLAYER_CLASS}`));
    const [videoElem, setVideoElem] = useState<HTMLVideoElement | null>(document.querySelector(`.${NETFLIX_VIDEO_CLASS}`) as HTMLVideoElement | null);
    const [segmenter, setSegmenter] = useState<Segmenter | null>(null);

    const context = new ExtensionContext(() => setInvalidated(true));

    useEffect(() => {
        const dbStatusStorage = new BrowserStorage<DBStatusResult>(DB_STATUS_KEY, StorageType.Local, context);
        const movieIdStorage = new BrowserStorage<MovieId>(MOVIE_KEY, StorageType.Session, context);
        const onDBStatusChanged = BrowserStorageListener.create(dbStatusStorage, (_, newValue) => setDBStatus(newValue), context);
        const onMovieIdChanged = BrowserStorageListener.create(movieIdStorage, (_, newValue) => setCurrMovie(newValue), context);
        if (onDBStatusChanged) {
            dbStatusStorage.addOnChangedListener(onDBStatusChanged);
        }
        if (onMovieIdChanged) {
            movieIdStorage.addOnChangedListener(onMovieIdChanged);
        }
        dbStatusStorage.get().then(status => {
            if (status) {
                setDBStatus(status);
            }
        });
        movieIdStorage.get().then(movieId => {
            if (movieId) {
                setCurrMovie(movieId);
            }
        });

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
            if (onDBStatusChanged) {
                dbStatusStorage.removeOnChangedListener(onDBStatusChanged);
            }
            if (onMovieIdChanged) {
                movieIdStorage.removeOnChangedListener(onMovieIdChanged);
            }
            window.removeEventListener(RuntimeEvent.MetadataDetected, metadataListener);
            window.removeEventListener(RuntimeEvent.MetadataDetected, trackSwitchedListener);
            netflixObserver.disconnect();
        };
    }, []);

    if (invalidated) {
        return (
            <Modal open={invalidated} headerText={"Extension Updated"} bodyText={"It looks like Jimakun was updated or reinstalled from another tab. Please reload the page for changes to take effect."} buttons={{ type: AlertType.AlertReload }} scale={2.0}></Modal>
        )
    }

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
                    <ChromeExtensionContext.Provider value={context}>
                        <Video dbStatus={dbStatus} webvttSubtitles={subtitles} videoElem={videoElem}></Video>
                    </ChromeExtensionContext.Provider>
                </SegmenterContext.Provider>,
                netflixPlayer
            )
            }

        </>
    )
}

export default App