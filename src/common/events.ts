import { TatoebaSentence } from "./tatoeba-types";

export enum RuntimeEvent {
    CountKanji = 'count-kanji',
    CountSentences = 'count-sentences',
    LookupKanji = 'lookup-kanji',
    LookupSentences = 'lookup-sentences',
    LookupWord = 'lookup-word',
    MetadataDetected = 'metadata-detected',
    PlayAudio = 'play-audio',
    PurgeDictionaries = 'purge-dictionaries',
    SubtitleTrackSwitched = 'subtitle-track-switched',
    SeekCue = 'seek-cue',
    SeekTime = 'seek-time',
    ToggleSubs = 'toggle-subs',
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

export interface CountKanjiMessage {
    kanji: string[];
}

export interface CountSentencesMessage {
    searchTerm: string;
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