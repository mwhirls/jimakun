import React, { useState, useEffect } from 'react'
import Subtitle, { SubtitleLoading } from "./Subtitle";
import { RuntimeEvent, RuntimeMessage } from '../../common/events';
import { ChildMutationType, querySelectorMutation } from '../util/util';
import { DBStatusResult, Status } from '../../service-worker/database/dbstatus';
import { WordIndex } from './Word';
import { useResizeObserver } from '../../common/hooks/useResizeObserver';
import Track, { ParsedCue, extractCueText } from './Track';
import { useNetflixSubtitleSuppressor } from '../../common/hooks/useNetflixSubtitles';

const NETFLIX_BOTTOM_CONTROLS_CLASS = 'watch-video--bottom-controls-container';

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
    const [show, setShow] = useState(true);
    const [selectedWord, setSelectedWord] = useState<WordIndex | null>(null);
    useNetflixSubtitleSuppressor();

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
                }
            }
        });
        const config = { attributes: true, attibuteFilter: ['style'], childList: true, subtree: true };
        netflixObserver.observe(document.body, config);

        return () => {
            chrome.runtime.onMessage.removeListener(runtimeListener);
            netflixObserver.disconnect();
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