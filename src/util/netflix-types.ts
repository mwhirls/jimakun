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

export type CdnUrl = z.infer<typeof CdnUrl>;
export type TTDownloadable = z.infer<typeof TTDownloadable>;
export type TimedTextTrack = z.infer<typeof TimedTextTrack>;
export type RecommendedMedia = z.infer<typeof RecommendedMedia>;
export type NetflixMetadata = z.infer<typeof NetflixMetadata>;
export type TimedTextSwitch = z.infer<typeof TimedTextSwitch>;