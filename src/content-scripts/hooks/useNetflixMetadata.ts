import { useEffect, useState } from "react";
import { RuntimeEvent } from "../../common/events";
import { TimedTextTrack, NetflixMetadata, TimedTextSwitch } from "../../common/netflix-types";
import { WebvttSubtitles } from "../components/Video";
import { WEBVTT_FORMAT } from "../util/util";

export type MovieId = number;
export type SubtitleTracks = Map<string, SubtitleData>;

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

export function useNetflixMetadata(): [Map<MovieId, SubtitleTracks>, string] {
    const [subtitleData, setSubtitleData] = useState(new Map<MovieId, SubtitleTracks>);
    const [currTrack, setCurrTrack] = useState("");

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
            const data = (event as CustomEvent).detail as TimedTextSwitch; // todo: validate
            setCurrTrack(data.track.trackId);
        };
        window.addEventListener(RuntimeEvent.enum.MetadataDetected, metadataListener);
        window.addEventListener(RuntimeEvent.enum.SubtitleTrackSwitched, trackSwitchedListener);

        return () => {
            window.removeEventListener(RuntimeEvent.enum.MetadataDetected, metadataListener);
            window.removeEventListener(RuntimeEvent.enum.SubtitleTrackSwitched, trackSwitchedListener);
        };
    }, []);

    return [subtitleData, currTrack];
}