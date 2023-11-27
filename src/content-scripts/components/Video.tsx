import { TRACK_ELEM_ID } from "../util/util"
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom';
import './Video.css'

const NETFLIX_PLAYER_CLASS = ".watch-video--player-view";

export interface WebvttSubtitles {
    webvttUrl: string,
    bcp47: string,
}

// Add a ghost subtitle track to the Netflix video player so we can listen
// for subtitle cue changes
function updateSubtitleTrack(subtitles: WebvttSubtitles | undefined, onCueChange: (ev: Event) => any) {
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
    videoElem.textTracks[last].addEventListener('cuechange', onCueChange);
}

interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}

// https://stackoverflow.com/questions/17056654/getting-the-real-html5-video-width-and-height
function calculateViewRect(video: HTMLVideoElement): Rect {
    const videoRatio = video.videoWidth / video.videoHeight;
    let width = video.offsetWidth;
    let height = video.offsetHeight;
    const elementRatio = width / height;

    if (elementRatio > videoRatio) {
        width = height * videoRatio;
    } else {
        height = width / videoRatio;
    }

    return {
        left: video.offsetWidth / 2 - width / 2,
        top: video.offsetHeight / 2 - height / 2,
        width: width,
        height: height,
    };
}

interface VideoProps {
    subtitles: WebvttSubtitles | undefined
}

function Video({ subtitles }: VideoProps) {
    const video = document.querySelector("video");
    const netflixPlayer = document.querySelector(NETFLIX_PLAYER_CLASS);
    if (!video || !netflixPlayer) {
        console.error("[JIMAKUN] Unable to render subtitles; could not find <video> or Netflix player on DOM");
        return (<></>);
    }

    const [activeCues, setActiveCues] = useState<string[]>([]);
    const [rect, setRect] = useState(calculateViewRect(video));

    const onCueChange = (e: Event) => {
        const track = e.target as TextTrack;
        if (!track || !track.activeCues) {
            return;
        }
        let cueTexts: string[] = [];
        for (let i = 0; i < track.activeCues.length; i++) {
            const cue = track.activeCues[i] as any; // cue.text is not documented
            const tagsRegex = '(<([^>]+>)|&lrm;|&rlm;)';
            const regex = new RegExp(tagsRegex, 'ig');
            const match = regex.exec(cue.text);
            let cueText = match ? cue.text.replace(regex, '') : cue.text;
            cueTexts.push(cueText);
        }
        const changed = cueTexts.length !== activeCues.length || cueTexts.some((value, index) => value !== activeCues[index]);
        if (changed) {
            setActiveCues(cueTexts);
        }
    };
    updateSubtitleTrack(subtitles, onCueChange);

    useEffect(() => {
        const resizeListener = async (_event: Event) => {
            setRect(calculateViewRect(video));
        };
        window.addEventListener("resize", resizeListener);
        return () => {
            window.removeEventListener("resize", resizeListener);
        };
    }, []);

    // Add a dummy <div> container that acts as a proxy for the Netflix video screen
    // to help layout the child components.
    // Appending to the Netflix player element since its layout is fairly stable and consistent,
    // and doesn't typically cause issues with blocking input, etc
    // todo: use tailwind
    const style = {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
    };
    return (
        <>
            {createPortal(
                <div style={style} className="jimakun-video">
                    <p>{activeCues}</p>
                </div>,
                netflixPlayer
            )}
        </>
    )
}

export default Video;