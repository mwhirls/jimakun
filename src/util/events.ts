export enum RuntimeEvent {
    SubtitlesDetected = 'subtitles-detected',
    MovieUpdated = 'movie-updated',
}

export interface MovieChangedMessage {
    event: RuntimeEvent.MovieUpdated,
    movieId: string
}