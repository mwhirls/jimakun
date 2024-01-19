import { DBOperation } from "../database/database";
import { Progress } from "./progress";
import { TatoebaSentence } from "./tatoeba-types";

export enum RuntimeEvent {
    LookupKanji = 'lookup-kanji',
    LookupSentences = 'lookup-sentences',
    LookupWord = 'lookup-word',
    MetadataDetected = 'metadata-detected',
    MovieUpdated = 'movie-updated',
    SubtitleTrackSwitched = 'subtitle-track-switched',
    SeekCue = 'seek-cue',
    SeekTime = 'seek-time',
    ToggleSubs = 'toggle-subs',
    PlayAudio = 'play-audio',
    RequestDBStatus = 'request-db-status',
    ReportDBStatus = 'report-db-status',
}

export interface RuntimeMessage {
    event: RuntimeEvent,
    data: unknown
}

export interface MovieChangedMessage {
    movieId: string
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

export enum DataSource {
    JMDict = 'jmdict',
    KanjiDic2 = 'kanji-dic2',
    Tatoeba = 'tatoeba',
    Unknown = '',
}

export enum Status {
    Ready = 'ready',
    Blocked = 'blocked',
    Busy = 'busy',
}

export interface Ready {
    type: Status.Ready;
}

export interface Blocked {
    type: Status.Blocked;
}

export interface Busy {
    type: Status.Busy;
    operation: DBOperation;
    progress: Progress;
    source?: DataSource;
}

export interface DBStatusResult {
    status: Ready | Blocked | Busy;
}