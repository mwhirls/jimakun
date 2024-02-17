import React, { useState, useEffect } from 'react'
import { ChildMutationType, querySelectorMutation } from '../util/util';
import { DBStatusResult } from '../../service-worker/database/dbstatus';
import { WordIndex } from './Word';
import { useResizeObserver } from '../../common/hooks/useResizeObserver';
import Track, { ParsedCue } from './Track';
import { useNetflixSubtitleSuppressor } from '../../common/hooks/useNetflixSubtitleSuppressor';
import AbsoluteBox from '../../common/components/AbsoluteBox';
import SubtitleContainer from './SubtitleContainer';

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
    const [selectedWord, setSelectedWord] = useState<WordIndex | null>(null);
    useNetflixSubtitleSuppressor();

    useEffect(() => {
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
            netflixObserver.disconnect();
        };
    }, []);

    const onCuesParsed = (cues: ParsedCue[]) => {
        setSelectedWord(null);
        setParsedCues(cues);
    }

    const fontSize = rect.height * 0.035;
    const bottomOffset = calculateSubtitleOffset(rect, controlsElem);

    // Add a container that acts as a proxy for the Netflix video screen
    // to help layout the child components.
    return (
        <>
            <AbsoluteBox rect={rect} pointerEvents='pointer-events-none' zIndex='z-10'>
                <SubtitleContainer
                    fontSize={fontSize}
                    bottomOffset={bottomOffset}
                    dbStatus={dbStatus}
                    parsedCues={parsedCues}
                    activeCues={activeCues}
                    selectedWord={selectedWord}
                    setSelectedWord={setSelectedWord}>
                </SubtitleContainer>
            </AbsoluteBox>
            <Track webvttSubtitles={webvttSubtitles} videoElem={videoElem} onCuesAvailable={cues => setActiveCues(cues)} onCuesParsed={onCuesParsed}></Track>
        </>
    )
}

export default Video;