// must run in the MAIN world since we need to manipulate some global variables

import { RuntimeEvent, SeekTimeMessage } from "../common/events";
import { Netflix, NetflixMetadata, TimedTextSwitch } from "../common/netflix-types";

declare global {
    const netflix: unknown; // Netflix API object should exist on the page
}

const WEBVTT_FORMAT = 'webvtt-lssdh-ios8';
const NETFLIX_PROFILES = [
    'heaac-2-dash',
    'heaac-2hq-dash',
    'playready-h264mpl30-dash',
    'playready-h264mpl31-dash',
    'playready-h264hpl30-dash',
    'playready-h264hpl31-dash',
    'vp9-profile0-L30-dash-cenc',
    'vp9-profile0-L31-dash-cenc',
    'dfxp-ls-sdh',
    'simplesdh',
    'nflx-cmisc',
    'BIF240',
    'BIF320'
];

function isSubtitlesProperty(key: string, value: unknown): boolean {
    if (key === 'profiles' && Array.isArray(value)) {
        return value.some(item => NETFLIX_PROFILES.includes(item));
    }
    return false;
}

function findSubtitlesProperty(obj: object): Array<string> | null {
    for (const key in obj) {
        const value = obj[key as keyof typeof obj];
        if (Array.isArray(value)) {
            if (isSubtitlesProperty(key, value)) {
                return value;
            }
        }
        if (typeof value === 'object') {
            const prop = findSubtitlesProperty(value);
            if (prop) {
                return prop;
            }
        }
    }

    return null;
}

// Force a request for WebVTT to make Netflix return plain text subtitles
const originalStringify = JSON.stringify;
JSON.stringify = (value) => {
    const prop = findSubtitlesProperty(value);
    if (prop) {
        prop.unshift(WEBVTT_FORMAT);
    }
    return originalStringify(value);
}

const originalParse = JSON.parse;
JSON.parse = (text) => {
    const parsed = originalParse(text);
    if (parsed) {
        if (parsed.result) {
            const metadata = NetflixMetadata.safeParse(parsed.result);
            if (metadata.success) {
                window.dispatchEvent(new CustomEvent(RuntimeEvent.MetadataDetected, { detail: metadata.data }));
            }
        }
        const tts = TimedTextSwitch.safeParse(parsed);
        if (tts.success) {
            window.dispatchEvent(new CustomEvent(RuntimeEvent.SubtitleTrackSwitched, { detail: tts.data }));
        }
    }
    return parsed;
}

window.addEventListener(RuntimeEvent.SeekTime, (event) => {
    const data = (event as CustomEvent).detail as SeekTimeMessage;
    const time = data.startTime;

    // Get the Netflix video player using their native API
    // https://stackoverflow.com/questions/42105028/netflix-video-player-in-chrome-how-to-seek
    try {
        const n = Netflix.parse(netflix);
        const videoPlayer = n.appContext.state.playerApp.getAPI().videoPlayer;
        const playerSessionId = videoPlayer.getAllPlayerSessionIds()[0]
        const player = videoPlayer.getVideoPlayerBySessionId(playerSessionId)
        player.seek(time * 1000);
    } catch (error) {
        console.error(`Unable to seek to time ${time}`, error);
    }
});