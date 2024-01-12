export enum RuntimeEvent {
    MetadataDetected = 'metadata-detected',
    MovieUpdated = 'movie-updated',
    SubtitleTrackSwitched = 'subtitle-track-switched',
    SeekCue = 'seek-cue',
    SeekTime = 'seek-time',
    ToggleSubs = 'toggle-subs',
    LookupWord = 'lookup-word',
    PlayAudio = 'play-audio',
    LookupSentences = 'lookup-sentences',
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

export interface PlayAudioMessage {
    utterance: string;
}