import { z } from "zod";

export const CdnUrl = z.object({
    cdn_id: z.number(),
    url: z.string(),
});

export const TTDownloadable = z.object({
    urls: z.array(z.object(CdnUrl.shape)),
});

export const TimedTextTrack = z.object({
    language: z.nullable(z.string()),
    languageDescription: z.string(),
    new_track_id: z.string(),
    ttDownloadables: z.record(z.object(TTDownloadable.shape)),
});

export const RecommendedMedia = z.object({
    timedTextTrackId: z.string(),
});

export const NetflixMetadata = z.object({
    movieId: z.number(),
    recommendedMedia: z.object(RecommendedMedia.shape),
    timedtexttracks: z.array(z.object(TimedTextTrack.shape)),
});

export const TimedTextSwitch = z.object({
    track: z.object({ trackId: z.string() })
});

export const NetflixSessionPlayer = z.object({
    seek: z.function().args(z.number())
})

export const NetflixVideoPlayer = z.object({
    getAllPlayerSessionIds: z.function().returns(z.array(z.string())),
    getVideoPlayerBySessionId: z.function().args(z.string()).returns(z.object(NetflixSessionPlayer.shape)),
})

export const NetflixAPI = z.object({
    videoPlayer: z.object(NetflixVideoPlayer.shape)
});

export const NetflixPlayerApp = z.object({
    getAPI: z.function().returns(z.object(NetflixAPI.shape))
});

export const NetflixState = z.object({
    playerApp: z.object(NetflixPlayerApp.shape)
});

export const NetflixAppContext = z.object({
    state: z.object(NetflixState.shape)
});

export const Netflix = z.object({
    appContext: z.object(NetflixAppContext.shape)
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