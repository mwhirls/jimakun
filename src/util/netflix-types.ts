export interface CdnUrl {
    cdn_id: number,
    url: string,
}

export interface TTDownloadable {
    urls: CdnUrl[],
}

export interface TimedTextTrack {
    language: string,
    languageDescription: string,
    new_track_id: string,
    ttDownloadables: { [key: string]: TTDownloadable },
}

export interface RecommendedMedia {
    timedTextTrackId: string,
}

export interface NetflixMetadata {
    movieId: number,
    recommendedMedia: RecommendedMedia,
    timedtexttracks: Array<TimedTextTrack>
}

export function instanceOfNetflixMetadata(arg: any): arg is NetflixMetadata {
    // quick and dirty check, can make this more robust later if
    // needed
    return arg &&
        arg.movieId && typeof arg.movieId === "number" &&
        arg.recommendedMedia &&
        arg.timedtexttracks && Array.isArray(arg.timedtexttracks);
}

export interface TimedTextSwitch {
    track: { trackId: string };
}

export function instanceOfTimedTextSwitch(arg: any): arg is TimedTextSwitch {
    return arg &&
        arg.track &&
        arg.track.trackId && typeof arg.track.trackId === "string";
}