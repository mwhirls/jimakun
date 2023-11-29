export enum RuntimeEvent {
    MetadataDetected = 'metadata-detected',
    MovieUpdated = 'movie-updated',
    SubtitleTrackSwitched = 'subtitle-track-switched',
    SeekCue = 'seek-cue',
    SeekTime = 'seek-time',
    ToggleSubs = 'toggle-subs',
}

export interface RuntimeMessage {
    event: RuntimeEvent,
    data: any
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