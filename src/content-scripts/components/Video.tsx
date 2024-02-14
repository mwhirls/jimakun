import React, { useState, useEffect } from 'react'
import Subtitle, { SubtitleLoading } from "./Subtitle";
import { RuntimeEvent, RuntimeMessage } from '../../common/events';
import { ChildMutationType, querySelectorMutation } from '../util/util';
import { DBStatusResult, Status } from '../../service-worker/database/dbstatus';
import { WordIndex } from './Word';
import { useResizeObserver } from '../../common/hooks/useResizeObserver';
import Track, { ParsedCue, extractCueText } from './Track';

const NETFLIX_BOTTOM_CONTROLS_CLASS = 'watch-video--bottom-controls-container';
const NETFLIX_TEXT_SUBTITLE_CLASS = "player-timedtext";
const NETFLIX_IMAGE_SUBTITLE_CLASS = "image-based-timed-text";

export interface WebvttSubtitles {
    webvttUrl: string,
    bcp47: string,
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

class StyledNode {
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
    dbStatus: DBStatusResult | null;
    webvttSubtitles: WebvttSubtitles;
    videoElem: HTMLVideoElement;
}

function Video({ dbStatus, webvttSubtitles, videoElem }: VideoProps) {
    const [activeCues, setActiveCues] = useState<TextTrackCue[]>([]);
    const [parsedCues, setParsedCues] = useState<ParsedCue[]>([]);
    const rect = useResizeObserver(videoElem);
    const [controlsElem, setControlsElem] = useState(document.querySelector(`.${NETFLIX_BOTTOM_CONTROLS_CLASS}`));
    const [timedTextElem, setTimedTextElem] = useState<StyledNode | null>(queryStyledNode(NETFLIX_TEXT_SUBTITLE_CLASS));
    const [imageTimedTextElem, setImageTimedTextElem] = useState<StyledNode | null>(queryStyledNode(NETFLIX_TEXT_SUBTITLE_CLASS));
    const [show, setShow] = useState(true);
    const [selectedWord, setSelectedWord] = useState<WordIndex | null>(null);

    useEffect(() => {
        const runtimeListener = (message: RuntimeMessage) => {
            if (message.event === RuntimeEvent.enum.ToggleSubs) {
                setShow(prev => !prev);
            }
        };
        chrome.runtime.onMessage.addListener(runtimeListener);

        // Get handles to relevant Netflix DOM elements
        const netflixObserver = new MutationObserver((mutationsList: MutationRecord[]) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const controls = querySelectorMutation(mutation, `.${NETFLIX_BOTTOM_CONTROLS_CLASS}`);
                    if (controls) {
                        setControlsElem(controls.type === ChildMutationType.Added ? controls.elem : null);
                    }
                } else if (mutation.type === 'attributes') {
                    if (!(mutation.target instanceof Element)) {
                        continue;
                    }
                    // hide original Netflix subtitles
                    const node = new StyledNode(mutation.target as HTMLElement);
                    if (node.element.className === NETFLIX_TEXT_SUBTITLE_CLASS) {
                        node.show(false);
                        setTimedTextElem(node);
                    } else if (node.element.className === NETFLIX_IMAGE_SUBTITLE_CLASS) {
                        node.show(false);
                        setImageTimedTextElem(node);
                    }
                }
            }
        });
        const config = { attributes: true, attibuteFilter: ['style'], childList: true, subtree: true };
        netflixObserver.observe(document.body, config);

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
            chrome.runtime.onMessage.removeListener(runtimeListener);
            netflixObserver.disconnect();
            const showNetflixSubtitles = () => {
                timedTextElem?.show(true);
                imageTimedTextElem?.show(true);
            };
            showNetflixSubtitles();
        };
    }, []);

    const onCuesParsed = (cues: ParsedCue[]) => {
        setSelectedWord(null);
        setParsedCues(cues);
    }

    const videoStyle = {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
    };
    const fontSize = rect.height * 0.035;
    const bottomOffset = calculateSubtitleOffset(rect, controlsElem);
    const containerStyle = {
        bottom: `${bottomOffset}px`,
    };
    const subtitles = () => {
        if (!show) {
            return <></>;
        }
        const status = dbStatus?.status;
        switch (status?.type) {
            case Status.Ready:
                return parsedCues.map((cue, index) => {
                    return (
                        <Subtitle key={index} lines={cue} selectedWord={selectedWord} setSelectedWord={(index) => setSelectedWord(index)} fontSize={fontSize}></Subtitle>
                    )
                });
            case Status.Blocked:
            case Status.Busy:
            case Status.ErrorOccurred:
            case Status.VersionChanged: {
                return activeCues.map((cue, index) => {
                    return (
                        <SubtitleLoading key={index} dbStatus={status} cueText={extractCueText(cue)} fontSize={fontSize}></SubtitleLoading>
                    )
                })
            }
            default:
                return <></>;
        }
    }

    // Add a dummy <div> container that acts as a proxy for the Netflix video screen
    // to help layout the child components.
    return (
        <>
            <div id="jimakun-video" className="absolute pointer-events-none z-10" style={videoStyle}>
                <div id="jimakun-subtitle-container" className="absolute text-center w-full" style={containerStyle}>{subtitles()}</div>
            </div>
            <Track webvttSubtitles={webvttSubtitles} videoElem={videoElem} onCuesAvailable={cues => setActiveCues(cues)} onCuesParsed={onCuesParsed}></Track>
        </>
    )
}

export default Video;