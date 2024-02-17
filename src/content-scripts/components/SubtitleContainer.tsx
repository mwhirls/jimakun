import React, { useState, useEffect } from 'react'
import Subtitle, { SubtitleLoading } from "./Subtitle";
import { RuntimeEvent, RuntimeMessage } from '../../common/events';
import { DBStatusResult, Status } from '../../service-worker/database/dbstatus';
import { WordIndex } from './Word';
import { ParsedCue, extractCueText } from './Track';
import { useNetflixSubtitleSuppressor } from '../hooks/useNetflixSubtitleSuppressor';

interface ContentProps {
    dbStatus: DBStatusResult | null;
    parsedCues: ParsedCue[];
    activeCues: TextTrackCue[];
    selectedWord: WordIndex | null;
    setSelectedWord: (index: WordIndex | null) => void;
}

function Content({ parsedCues, activeCues, dbStatus, selectedWord, setSelectedWord }: ContentProps) {
    const status = dbStatus?.status;
    switch (status?.type) {
        case Status.Ready:
            return parsedCues.map((cue, index) => {
                return (
                    <Subtitle key={index} lines={cue} selectedWord={selectedWord} setSelectedWord={setSelectedWord}></Subtitle>
                )
            });
        case Status.Blocked:
        case Status.Busy:
        case Status.ErrorOccurred:
        case Status.VersionChanged: {
            return activeCues.map((cue, index) => {
                return (
                    <SubtitleLoading key={index} dbStatus={status} cueText={extractCueText(cue)}></SubtitleLoading>
                )
            })
        }
        default:
            return <></>;
    }
}

interface SubtitleContainerProps {
    dbStatus: DBStatusResult | null;
    parsedCues: ParsedCue[];
    activeCues: TextTrackCue[];
    selectedWord: WordIndex | null;
    setSelectedWord: (index: WordIndex | null) => void;
    fontSize: number;
    bottomOffset: number;
}

function SubtitleContainer({ dbStatus, parsedCues, activeCues, selectedWord, setSelectedWord, fontSize, bottomOffset }: SubtitleContainerProps) {
    const [show, setShow] = useState(true);
    useNetflixSubtitleSuppressor();

    useEffect(() => {
        const runtimeListener = (message: RuntimeMessage) => {
            if (message.event === RuntimeEvent.enum.ToggleSubs) {
                setShow(prev => !prev);
            }
        };
        chrome.runtime.onMessage.addListener(runtimeListener);

        return () => {
            chrome.runtime.onMessage.removeListener(runtimeListener);
        };
    }, []);

    if (!show) {
        return <></>;
    }

    const style = {
        bottom: `${bottomOffset}px`,
        fontSize: `${fontSize}px`,
    };

    return (
        <div className="absolute text-center w-full" style={style}>
            <Content
                dbStatus={dbStatus}
                parsedCues={parsedCues}
                activeCues={activeCues}
                selectedWord={selectedWord}
                setSelectedWord={setSelectedWord}>
            </Content>
        </div>
    )
}

export default SubtitleContainer;