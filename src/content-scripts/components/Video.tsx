import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom';
import Subtitle from "./Subtitle";

const NETFLIX_BOTTOM_CONTROLS_CLASS = '.watch-video--bottom-controls-container';

export interface WebvttSubtitles {
    webvttUrl: string,
    bcp47: string,
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

function hasControls() {
    return document.querySelector(NETFLIX_BOTTOM_CONTROLS_CLASS) != null;
}

interface VideoProps {
    webvttSubtitles: WebvttSubtitles | undefined;
    videoElem: HTMLVideoElement;
}

function Video({ webvttSubtitles, videoElem }: VideoProps) {
    const [activeCues, setActiveCues] = useState<string[]>([]);
    const [rect, setRect] = useState(calculateViewRect(videoElem));
    const [showingControls, setShowingControls] = useState(hasControls());
    const trackRef = useRef<HTMLTrackElement>(null);

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
        setActiveCues(cueTexts);
    };

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target.tagName === 'VIDEO') {
                    const newRect = calculateViewRect(entry.target as HTMLVideoElement);
                    setRect(newRect);
                } else {
                    console.warn(`[JIMAKUN] resize event handled for unknown element ${entry}`);
                }
            }
        });
        resizeObserver.observe(videoElem);
        if (trackRef.current) {
            trackRef.current.track.mode = 'hidden';
            trackRef.current.track.addEventListener('cuechange', onCueChange);
        }
        return () => {
            resizeObserver.disconnect();
            if (trackRef.current) {
                trackRef.current.track.removeEventListener('cuechange', onCueChange);
            }
        };
    }, []);

    useEffect(() => {
        // Need to move subtitles if the controls show up on the screen
        const netflixObserver = new MutationObserver(mutationCallback);
        function mutationCallback(mutationsList: MutationRecord[], observer: MutationObserver) {
            for (let mutation of mutationsList) {
                if (mutation.type != 'childList' || !mutation.addedNodes) {
                    continue;
                }
                setShowingControls(hasControls());
            }
        }
        const config = { attributes: false, childList: true, subtree: true };
        netflixObserver.observe(document.body, config);

        return () => {
            netflixObserver.disconnect();
        };
    }, []);

    const videoStyle = {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
    };
    const fontSize = rect.height * 0.035;
    const bottomPct = showingControls ? 18.2827 : 10; // todo: better values
    const subtitles = activeCues.map((value, index) => <Subtitle key={index} text={value} fontSize={fontSize}></Subtitle>);
    const containerStyle = {
        bottom: `${bottomPct}%`,
    };

    // Add a dummy <div> container that acts as a proxy for the Netflix video screen
    // to help layout the child components.
    // Add a hidden subtitle <track> to the Netflix video player so we can listen
    // for subtitle cue changes
    return (
        <>
            <div id="jimakun-video" className="absolute pointer-events-none z-10" style={videoStyle}>
                <div id="jimakun-subtitle-container" className="absolute text-center left-1/2" style={containerStyle}>{subtitles}</div>
            </div>
            {createPortal(
                <track ref={trackRef} label="Jimakun" kind="subtitles" default={true} src={webvttSubtitles?.webvttUrl} srcLang={webvttSubtitles?.bcp47}></track>,
                videoElem
            )}
        </>
    )
}

export default Video;