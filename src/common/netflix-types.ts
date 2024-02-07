import { z } from "zod";

export const CdnUrl = z.object({
    cdn_id: z.number(),
    url: z.string(),
});

export const TTDownloadable = z.object({
    urls: z.array(CdnUrl),
});

export const TimedTextTrack = z.object({
    language: z.nullable(z.string()),
    languageDescription: z.string(),
    new_track_id: z.string(),
    ttDownloadables: z.record(TTDownloadable),
});

export const RecommendedMedia = z.object({
    timedTextTrackId: z.string(),
});

export const NetflixMetadata = z.object({
    movieId: z.number(),
    recommendedMedia: RecommendedMedia,
    timedtexttracks: z.array(TimedTextTrack),
});

export const TimedTextSwitch = z.object({
    track: z.object({ trackId: z.string() })
});

export const NetflixSessionPlayer = z.object({
    seek: z.function().args(z.number())
})

export const NetflixVideoPlayer = z.object({
    getAllPlayerSessionIds: z.function().returns(z.array(z.string())),
    getVideoPlayerBySessionId: z.function().args(z.string()).returns(NetflixSessionPlayer),
})

export const NetflixAPI = z.object({
    videoPlayer: NetflixVideoPlayer
});

export const NetflixPlayerApp = z.object({
    getAPI: z.function().returns(NetflixAPI)
});

export const NetflixState = z.object({
    playerApp: NetflixPlayerApp
});

export const NetflixAppContext = z.object({
    state: NetflixState
});

export const Netflix = z.object({
    appContext: NetflixAppContext
});

export type CdnUrl = z.infer<typeof CdnUrl>;
export type TTDownloadable = z.infer<typeof TTDownloadable>;
export type TimedTextTrack = z.infer<typeof TimedTextTrack>;
export type RecommendedMedia = z.infer<typeof RecommendedMedia>;
export type NetflixMetadata = z.infer<typeof NetflixMetadata>;
export type TimedTextSwitch = z.infer<typeof TimedTextSwitch>;
export type NetflixSessionPlayer = z.infer<typeof NetflixSessionPlayer>;
export type NetflixVideoPlayer = z.infer<typeof NetflixVideoPlayer>;
export type NetflixAPI = z.infer<typeof NetflixAPI>;
export type NetflixPlayerApp = z.infer<typeof NetflixPlayerApp>;
export type NetflixState = z.infer<typeof NetflixState>;
export type NetflixAppContext = z.infer<typeof NetflixAppContext>;
export type Netflix = z.infer<typeof Netflix>;