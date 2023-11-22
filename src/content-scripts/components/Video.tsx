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

interface VideoProps {
    subtitlesURL: string,
}

function Video({ subtitlesURL }: VideoProps) {
    useEffect(() => {
        addSubtitleTrack(subtitlesURL);
    }, []);

    return (
        <>
        </>
    )
}

export default Video;