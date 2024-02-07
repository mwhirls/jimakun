import React, { useState, useEffect, useRef, useContext } from 'react'
import { createPortal } from 'react-dom';
import Subtitle, { Line, SubtitleLoading, WordDetails } from "./Subtitle";
import { LookupWordsMessage, RuntimeEvent, RuntimeMessage, SeekCueMessage, SeekDirection } from '../../common/events';
import { ChildMutationType, querySelectorMutation } from '../util/util';
import { ChromeExtensionContext, ExtensionContext } from '../contexts/ExtensionContext';
import { toHiragana } from '../../common/lang';
import { SegmenterContext, SegmenterContextI } from '../contexts/SegmenterContext';
import * as bunsetsu from "bunsetsu";
import { sendMessage } from '../util/browser-runtime';
import { DBStatusResult, Status } from '../../service-worker/database/dbstatus';
import { WordIndex } from './Word';

const NETFLIX_BOTTOM_CONTROLS_CLASS = 'watch-video--bottom-controls-container';
const NETFLIX_TEXT_SUBTITLE_CLASS = "player-timedtext";
const NETFLIX_IMAGE_SUBTITLE_CLASS = "image-based-timed-text";

function toList(cueList: TextTrackCueList | null): TextTrackCue[] {
    if (!cueList) {
        return [];
    }
    const cues = [];
    for (let i = 0; i < cueList.length; i++) {
        const cue = cueList[i];
        cues.push(cue);
    }
    return cues;
}

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

    const rect = video.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const left = centerX - width / 2;
    const top = centerY - height / 2;

    return new DOMRect(
        left,
        top,
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

function findNearestCue(t: number, cues: TextTrackCue[]) {
    if (!cues.length) {
        return null;
    }

    let l = 0;
    let r = cues.length - 1;
    while (l < r) {
        const mid = Math.floor(l + (r - l) / 2);
        const cue = cues[mid];
        if (cue.startTime <= t && t <= cue.endTime) {
            return mid;
        }
        else if (cue.endTime < t) {
            l = mid + 1;
        }
        else if (cue.startTime > t) {
            r = mid - 1;
        }
    }
    return l;
}

// Seeks the video to the closest subtitle in the direction given
function onSeekCue(direction: SeekDirection, currentTime: number, cues: TextTrackCue[]) {
    let index = findNearestCue(currentTime, cues);
    if (!index) {
        return;
    }
    if (direction === SeekDirection.enum.Next) {
        index = Math.min(index + 1, cues.length - 1);
    }
    else if (direction === SeekDirection.enum.Previous) {
        index = Math.max(0, index - 1)
    }

    // videoElem.currentTime can't be set without triggering a Netflix error, 
    // so dispatch to the page script to set time directly using Netflix API
    const cue = cues[index];
    window.dispatchEvent(new CustomEvent(RuntimeEvent.enum.SeekTime, { detail: { startTime: cue.startTime } }));
}

interface CueWithText {
    text: string;
}
type UndocumentedCue = TextTrackCue & CueWithText;

function extractCueText(cue: TextTrackCue): string {
    const cueText = (cue as UndocumentedCue).text; // cue.text is not documented
    const tagsRegex = '(<([^>]+>)|&lrm;|&rlm;)';
    const regex = new RegExp(tagsRegex, 'ig');
    const match = regex.exec(cueText);
    return match ? cueText.replace(regex, '') : cueText;
}

function parseCue(cue: TextTrackCue, segmenter: bunsetsu.Segmenter | null): bunsetsu.Word[][] {
    const text = extractCueText(cue);
    if (!segmenter) {
        return [];
    }
    const lines = text.split('\n');
    return lines.map((line: string) => segmenter.segmentAsWords(line));
}

async function lookupWords(words: bunsetsu.Word[], context: ExtensionContext): Promise<WordDetails[]> {
    const data: LookupWordsMessage = {
        words: words.map(word => {
            return {
                surfaceForm: word.surfaceForm,
                baseForm: word.baseForm ?? "",
                katakana: word.reading ?? "",
                hiragana: toHiragana(word.reading),
            };
        })
    };
    const message: RuntimeMessage = { event: RuntimeEvent.enum.LookupWords, data: data };
    const entries = await sendMessage(message, context);
    return words.map((word, index) => {
        return {
            word,
            entry: entries[index]
        }
    });
}

async function lookupWordsInCue(cue: TextTrackCue, segmenterContext: SegmenterContextI, extensionContext: ExtensionContext): Promise<Line[]> {
    const lines = parseCue(cue, segmenterContext.segmenter);
    const results = lines.map(line => lookupWords(line, extensionContext));
    return Promise.all(results);
}

type ParsedCue = Line[];

interface VideoProps {
    dbStatus: DBStatusResult | null;
    webvttSubtitles: WebvttSubtitles;
    videoElem: HTMLVideoElement;
}

function Video({ dbStatus, webvttSubtitles, videoElem }: VideoProps) {
    const segmenterContext = useContext(SegmenterContext);
    const extensionContext = useContext(ChromeExtensionContext);
    const cuesRef = useRef<TextTrackCue[]>([]);
    const [activeCues, setActiveCues] = useState<TextTrackCue[]>([]);
    const [parsedCues, setParsedCues] = useState<ParsedCue[]>([]);
    const [rect, setRect] = useState(calculateViewRect(videoElem));
    const [controlsElem, setControlsElem] = useState(document.querySelector(`.${NETFLIX_BOTTOM_CONTROLS_CLASS}`));
    const [timedTextElem, setTimedTextElem] = useState<StyledNode | null>(queryStyledNode(NETFLIX_TEXT_SUBTITLE_CLASS));
    const [imageTimedTextElem, setImageTimedTextElem] = useState<StyledNode | null>(queryStyledNode(NETFLIX_TEXT_SUBTITLE_CLASS));
    const trackRef = useRef<HTMLTrackElement>(null);
    const [show, setShow] = useState(true);
    const [selectedWord, setSelectedWord] = useState<WordIndex | null>(null);

    useEffect(() => {
        const runtimeListener = (message: RuntimeMessage) => {
            if (message.event === RuntimeEvent.enum.SeekCue) {
                const data = message.data as SeekCueMessage;
                onSeekCue(data.direction, videoElem.currentTime, cuesRef.current);
            } else if (message.event === RuntimeEvent.enum.ToggleSubs) {
                setShow(prev => !prev);
            }
        };
        chrome.runtime.onMessage.addListener(runtimeListener);

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

        const onCueChange = (e: Event) => {
            if (!e.target) {
                return;
            }
            const track = e.target as TextTrack;
            const activeCues = toList(track.activeCues);
            setActiveCues(activeCues);
            const results = activeCues.map(cue => lookupWordsInCue(cue, segmenterContext, extensionContext));
            Promise.all(results).then(cues => {
                setParsedCues(cues);
                setSelectedWord(null);
            });
        };

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
            chrome.runtime.onMessage.removeListener(runtimeListener);
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
    // Add a hidden subtitle <track> to the Netflix video player so we can listen
    // for subtitle cue changes
    return (
        <>
            <div id="jimakun-video" className="absolute pointer-events-none z-10" style={videoStyle}>
                <div id="jimakun-subtitle-container" className="absolute text-center w-full" style={containerStyle}>{subtitles()}</div>
            </div>
            {createPortal(
                <track ref={trackRef} label="Jimakun" kind="subtitles" default={true} src={webvttSubtitles.webvttUrl} srcLang={webvttSubtitles.bcp47} onLoadCapture={(e) => {
                    if (!e.target) {
                        return;
                    }
                    const trackElem = e.target as HTMLTrackElement;
                    const track = trackElem.track;
                    cuesRef.current = toList(track.cues);
                }}></track>,
                videoElem
            )}
        </>
    )
}

export default Video;