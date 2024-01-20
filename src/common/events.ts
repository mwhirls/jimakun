import { TatoebaSentence } from "./tatoeba-types";

export enum RuntimeEvent {
    LookupKanji = 'lookup-kanji',
    LookupSentences = 'lookup-sentences',
    LookupWord = 'lookup-word',
    MetadataDetected = 'metadata-detected',
    SubtitleTrackSwitched = 'subtitle-track-switched',
    SeekCue = 'seek-cue',
    SeekTime = 'seek-time',
    ToggleSubs = 'toggle-subs',
    PlayAudio = 'play-audio',
}

export interface RuntimeMessage {
    event: RuntimeEvent,
    data: unknown
}

export enum SeekDirection {
    Next,
    Repeat,
    Previous,
}

export interface SeekCueMessage {
    direction: SeekDirection
}

export interface SeekTimeMessage {
    startTime: number
}

export interface LookupWordMessage {
    surfaceForm: string;
    baseForm: string;
    katakana: string;
    hiragana: string;
}

export interface Success<T> {
    type: 'success';
    data: T;
}

export interface Error<S> {
    type: 'error';
    data: S;
    message: string;
}

export interface MessageResponse<T, S> {
    result: Success<T> | Error<S>
}

export interface LookupSentencesMessage {
    searchTerm: string;
    page: number;
    perPage: number;
}

export interface LookupSentencesResult {
    sentences: TatoebaSentence[];
    pages: number;
}

export interface LookupKanjiMessage {
    kanji: string[];
}

export interface PlayAudioMessage {
    utterance: string;
}