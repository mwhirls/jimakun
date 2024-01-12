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

export interface LookupSentencesMessage {
    surfaceForm: string;
    baseForm: string;
    katakana: string;
    hiragana: string;
}

export interface LookupKanjiMessage {
    kanji: string[];
}

export interface PlayAudioMessage {
    utterance: string;
}