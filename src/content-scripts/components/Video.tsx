import { TRACK_ELEM_ID } from "../util/util"
import { useEffect } from 'react'

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

export interface WebvttSubtitles {
    webvttUrl: string,
    bcp47: string,
}

// Add a ghost subtitle track to the Netflix video player so we can listen
// for subtitle queue changes
function updateSubtitleTrack(subtitles: WebvttSubtitles | undefined) {
    let videoElem = document.querySelector("video");
    if (!videoElem) {
        console.error("[JIMAKUN] Unable to update subtitle track; could not find <video> on DOM");
        return;
    }
    document.getElementById(TRACK_ELEM_ID)?.remove();
    if (!subtitles) {
        return;
    }
    const trackElem = document.createElement('track');
    trackElem.id = TRACK_ELEM_ID;
    trackElem.label = 'Jimakun';
    trackElem.src = subtitles.webvttUrl;
    trackElem.kind = 'subtitles';
    trackElem.default = true;
    trackElem.srclang = subtitles.bcp47;
    videoElem.appendChild(trackElem);
    const last = videoElem.textTracks.length - 1;
    videoElem.textTracks[last].mode = 'hidden';
    videoElem.textTracks[last].addEventListener('cuechange', onCueChange, false);
}

interface VideoProps {
    subtitles: WebvttSubtitles | undefined
}

function Video({ subtitles }: VideoProps) {
    updateSubtitleTrack(subtitles);

    return (
        <>
        </>
    )
}

export default Video;