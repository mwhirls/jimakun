export interface CdnUrl {
    cdn_id: number,
    url: string,
}

export interface TextTrack {
    urls: CdnUrl[],
}

export interface SubtitleTrack {
    language: string,
    languageDescription: string,
    ttDownloadables: { [key: string]: TextTrack },
}

export interface SubtitleData {
    movieId: number,
    timedtexttracks: Array<SubtitleTrack>
}