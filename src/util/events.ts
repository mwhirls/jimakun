export enum RuntimeEvent {
    MetadataDetected = 'metadata-detected',
    MovieUpdated = 'movie-updated',
    SubtitleTrackSwitched = 'subtitle-track-switched'
}

export interface MovieChangedMessage {
    event: RuntimeEvent.MovieUpdated,
    movieId: string
}