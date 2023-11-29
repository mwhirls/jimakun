import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom';
import { WebvttSubtitles } from './Video'
import Video from './Video'

import { ChildMutationType, WEBVTT_FORMAT, querySelectorMutation } from "../util/util"
import { TimedTextTrack, NetflixMetadata, RecommendedMedia, TimedTextSwitch } from "../../util/netflix-types";
import { RuntimeEvent, MovieChangedMessage, RuntimeMessage } from '../../util/events';
import { IpadicFeatures, Tokenizer, builder } from "kuromoji";
import { TokenizerContext } from '../contexts/TokenizerContext';

const NETFLIX_PLAYER_CLASS = "watch-video--player-view";
const NETFLIX_VIDEO_CLASS = `${NETFLIX_PLAYER_CLASS} video`

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
    const [moviesMetadata, setMoviesMetadata] = useState(new Map<string, MovieMetadata>);
    const [subtitleData, setSubtitleData] = useState(new Map<string, SubtitleData>);
    const [currMovie, setCurrMovie] = useState("");
    const [currTrack, setCurrTrack] = useState("");
    const [netflixPlayer, setNetflixPlayer] = useState<Element | null>(document.querySelector(`.${NETFLIX_PLAYER_CLASS}`));
    const [videoElem, setVideoElem] = useState<HTMLVideoElement | null>(document.querySelector(`.${NETFLIX_VIDEO_CLASS}`) as HTMLVideoElement | null);
    const [tokenizer, setTokenizer] = useState<Tokenizer<IpadicFeatures> | null>(null);

    useEffect(() => {
        const metadataListener = async (event: Event) => {
            const data = (event as CustomEvent).detail as NetflixMetadata;
            const metadata = data;
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
        const runtimeListener = (message: RuntimeMessage) => {
            if (message.event === RuntimeEvent.MovieUpdated) {
                const data = message.data as MovieChangedMessage;
                setCurrMovie(data.movieId);
            }
        };
        window.addEventListener(RuntimeEvent.MetadataDetected, metadataListener);
        window.addEventListener(RuntimeEvent.SubtitleTrackSwitched, trackSwitchedListener);
        chrome.runtime.onMessage.addListener(runtimeListener);

        // We insert our components into the Netflix DOM, but they constantly
        // mutate it.  Watch for changes so we know when to re-render.
        const netflixObserver = new MutationObserver(mutationCallback);
        function mutationCallback(mutationsList: MutationRecord[], observer: MutationObserver) {
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

        try {
            const tokenizerBuilder = builder({ dicPath: chrome.runtime.getURL("dict/") });
            tokenizerBuilder.build(function (err: Error, tokenizer: Tokenizer<IpadicFeatures>) {
                if (err) {
                    console.error('[JIMAKUN] error when building tokenizer');
                }
                console.log('[JIMAKUN] Tokenizer built');
                setTokenizer(tokenizer);
            });
        } catch (err) {
            console.error('[JIMAKUN] error when building tokenizer');
        }

        return () => {
            window.removeEventListener(RuntimeEvent.MetadataDetected, metadataListener);
            window.removeEventListener(RuntimeEvent.MetadataDetected, trackSwitchedListener);
            chrome.runtime.onMessage.removeListener(runtimeListener);
            netflixObserver.disconnect();
        };
    }, []);

    const subtitles = subtitleData.get(currTrack);
    if (netflixPlayer && videoElem && subtitles) {
        // Appending to the Netflix player element since its layout is fairly stable and consistent,
        // and doesn't typically cause issues with blocking input, etc
        return (
            <>

                {createPortal(
                    <TokenizerContext.Provider value={{ tokenizer: tokenizer }}>
                        <Video webvttSubtitles={subtitles} videoElem={videoElem}></Video>
                    </TokenizerContext.Provider>,
                    netflixPlayer
                )}

            </>
        )
    } else {
        return (<></>);
    }
}

export default App