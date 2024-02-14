import React, { useContext, useRef, useEffect } from "react";
import { ChromeExtensionContext, ExtensionContext } from "../contexts/ExtensionContext";
import { SegmenterContext, SegmenterContextI } from "../contexts/SegmenterContext";
import { Line, WordDetails } from "./Subtitle";
import { WebvttSubtitles } from "./Video";
import { LookupWordsMessage, RuntimeMessage, RuntimeEvent, SeekCueMessage, SeekDirection } from "../../common/events";
import { toHiragana } from "../../common/lang";
import { sendMessage } from "../util/browser-runtime";
import * as bunsetsu from "bunsetsu";
import { createPortal } from "react-dom";

interface CueWithText {
    text: string;
}
type UndocumentedCue = TextTrackCue & CueWithText;

export function extractCueText(cue: TextTrackCue): string {
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

export type ParsedCue = Line[];

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

interface TrackProps {
    webvttSubtitles: WebvttSubtitles;
    videoElem: HTMLVideoElement;
    onCuesAvailable: (cues: TextTrackCue[]) => void;
    onCuesParsed: (cues: ParsedCue[]) => void;
}

function Track({ webvttSubtitles, videoElem, onCuesAvailable, onCuesParsed }: TrackProps) {
    const segmenterContext = useContext(SegmenterContext);
    const extensionContext = useContext(ChromeExtensionContext);
    const cuesRef = useRef<TextTrackCue[]>([]);
    const trackRef = useRef<HTMLTrackElement>(null);

    useEffect(() => {
        const runtimeListener = (message: RuntimeMessage) => {
            if (message.event === RuntimeEvent.enum.SeekCue) {
                const data = message.data as SeekCueMessage;
                onSeekCue(data.direction, videoElem.currentTime, cuesRef.current);
            }
        };
        chrome.runtime.onMessage.addListener(runtimeListener);

        const onCueChange = (e: Event) => {
            if (!e.target) {
                return;
            }
            const track = e.target as TextTrack;
            const activeCues = toList(track.activeCues);
            onCuesAvailable(activeCues);
            const results = activeCues.map(cue => lookupWordsInCue(cue, segmenterContext, extensionContext));
            Promise.all(results).then(cues => {
                onCuesParsed(cues);
            });
        };

        if (trackRef.current) {
            trackRef.current.track.mode = 'hidden';
            trackRef.current.track.addEventListener('cuechange', onCueChange);
        }

        return () => {
            chrome.runtime.onMessage.removeListener(runtimeListener);
            if (trackRef.current) {
                trackRef.current.track.removeEventListener('cuechange', onCueChange);
            }
        };
    }, []);

    // Add a hidden subtitle <track> to the Netflix video player so we can listen
    // for subtitle cue changes
    return (
        <>
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

export default Track;