import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom';
import Subtitle from "./Subtitle";
import { IpadicFeatures, Tokenizer } from 'kuromoji';

const NETFLIX_BOTTOM_CONTROLS_CLASS = '.watch-video--bottom-controls-container';
const NETFLIX_TEXT_SUBTITLE_CLASS = "player-timedtext";
const NETFLIX_IMAGE_SUBTITLE_CLASS = "image-based-timed-text";

export interface WebvttSubtitles {
    webvttUrl: string,
    bcp47: string,
}

// https://stackoverflow.com/questions/17056654/getting-the-real-html5-video-width-and-height
function calculateViewRect(video: HTMLVideoElement): DOMRect {
    const videoRatio = video.videoWidth / video.videoHeight;
    let width = video.offsetWidth;
    let height = video.offsetHeight;
    const elementRatio = width / height;

    if (elementRatio > videoRatio) {
        width = height * videoRatio;
    } else {
        height = width / videoRatio;
    }

    return new DOMRect(
        video.offsetWidth / 2 - width / 2,
        video.offsetHeight / 2 - height / 2,
        width,
        height,
    );
}

function calculateSubtitleOffset(videoRect: DOMRect, controlsElem: Element | null): number {
    const defaultOffset = 0.1 * videoRect.height;
    if (!controlsElem) {
        return defaultOffset;
    }
    const subtitleBottom = videoRect.bottom - defaultOffset;
    const controlsRect = controlsElem.getBoundingClientRect();
    if (controlsRect.top > subtitleBottom) {
        return defaultOffset;
    }
    // subtitles intersecting controls, push subtitles up
    return defaultOffset + (subtitleBottom - controlsRect.top);
}

interface HTMLNode {
    element: HTMLElement;
    style: CSSStyleDeclaration;
}

class StyledNode implements HTMLNode {
    element: HTMLElement;
    style: CSSStyleDeclaration;

    constructor(element: HTMLElement) {
        this.element = element;
        this.style = element.style;
    }

    show(show: boolean) {
        if (this.element) {
            this.element.style.visibility = show ? this.element.style.visibility : 'hidden';
        }
    }
}

function queryStyledNode(selector: string) {
    const elem = document.querySelector(selector);
    return elem ? new StyledNode(elem as HTMLElement) : null;
}

interface VideoProps {
    webvttSubtitles: WebvttSubtitles;
    videoElem: HTMLVideoElement;
    tokenizer: Tokenizer<IpadicFeatures> | null;
}

function Video({ webvttSubtitles, videoElem, tokenizer }: VideoProps) {
    const [activeCues, setActiveCues] = useState<string[]>([]);
    const [rect, setRect] = useState(calculateViewRect(videoElem));
    const [controlsElem, setControlsElem] = useState(document.querySelector(NETFLIX_BOTTOM_CONTROLS_CLASS));
    const [timedTextElem, setTimedTextElem] = useState<StyledNode | null>(queryStyledNode(NETFLIX_TEXT_SUBTITLE_CLASS));
    const [imageTimedTextElem, setImageTimedTextElem] = useState<StyledNode | null>(queryStyledNode(NETFLIX_TEXT_SUBTITLE_CLASS));
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

        // Get handles to relevant Netflix DOM elements
        const netflixObserver = new MutationObserver((mutationsList: MutationRecord[], observer: MutationObserver) => {
            for (const mutation of mutationsList) {
                // hide original Netflix subtitles
                const target = mutation.target ? new StyledNode(mutation.target as HTMLElement) : null;
                if (target?.element.className === NETFLIX_TEXT_SUBTITLE_CLASS) {
                    target.show(false);
                    setTimedTextElem(target);
                } else if (target?.element.className === NETFLIX_IMAGE_SUBTITLE_CLASS) {
                    target.show(false);
                    setImageTimedTextElem(target);
                }
            }
            const controls = document.querySelector(NETFLIX_BOTTOM_CONTROLS_CLASS);
            setControlsElem(controls);
        });
        const config = { attributes: true, attibuteFilter: ['style'], childList: true, subtree: true };
        netflixObserver.observe(document.body, config);

        if (trackRef.current) {
            trackRef.current.track.mode = 'hidden';
            trackRef.current.track.addEventListener('cuechange', onCueChange);
        }
        const hideNetflixSubtitles = () => {
            const timedText = queryStyledNode(`.${NETFLIX_TEXT_SUBTITLE_CLASS}`);
            timedText?.show(false);
            setTimedTextElem(timedTextElem);
            const imageTimedText = queryStyledNode(`.${NETFLIX_IMAGE_SUBTITLE_CLASS}`);
            imageTimedText?.show(false);
            setImageTimedTextElem(imageTimedText);
        };
        hideNetflixSubtitles();

        return () => {
            resizeObserver.disconnect();
            netflixObserver.disconnect();
            if (trackRef.current) {
                trackRef.current.track.removeEventListener('cuechange', onCueChange);
            }
            const showNetflixSubtitles = () => {
                timedTextElem?.show(true);
                imageTimedTextElem?.show(true);
            };
            showNetflixSubtitles();
        };
    }, []);

    const videoStyle = {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
    };
    const fontSize = rect.height * 0.035;
    const bottomOffset = calculateSubtitleOffset(rect, controlsElem);
    const subtitles = activeCues.map((value, index) => <Subtitle key={index} text={value} fontSize={fontSize} tokenizer={tokenizer}></Subtitle>);
    const containerStyle = {
        bottom: `${bottomOffset}px`,
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
                <track ref={trackRef} label="Jimakun" kind="subtitles" default={true} src={webvttSubtitles.webvttUrl} srcLang={webvttSubtitles.bcp47}></track>,
                videoElem
            )}
        </>
    )
}

export default Video;