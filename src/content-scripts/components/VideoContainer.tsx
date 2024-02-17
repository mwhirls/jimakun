import React from "react";
import { createPortal } from "react-dom";
import { StorageType } from "../../storage/storage";
import Video from "./Video";
import { DBStatusResult } from "../../service-worker/database/dbstatus";
import { useStorage } from "../../common/hooks/useStorage";
import { useExtensionEnabled } from "../../common/hooks/useExtensionEnabled";
import { MovieId, useNetflixMetadata } from "../hooks/useNetflixMetadata";
import { useNetflixPlayer } from "../hooks/useNetflixPlayer";

const MOVIE_KEY = 'lastMovieId';

interface VideoContainerProps {
    dbStatus: DBStatusResult | null;
}

function VideoContainer({ dbStatus }: VideoContainerProps) {
    const [currMovie] = useStorage<MovieId | null>(MOVIE_KEY, StorageType.Session, null);
    const [enabled] = useExtensionEnabled(false);
    const [subtitleData, currTrack] = useNetflixMetadata();
    const [netflixPlayer, videoElem] = useNetflixPlayer();

    const subtitleTracks = currMovie ? subtitleData.get(currMovie) : undefined;
    const subtitles = subtitleTracks?.get(currTrack);
    if (!netflixPlayer || !videoElem || !subtitles || !enabled) {
        return <></>;
    }

    // Appending to the Netflix player element since its layout is fairly stable and consistent,
    // and doesn't typically cause issues with blocking input, etc
    return (
        <>
            {
                createPortal(
                    <Video
                        dbStatus={dbStatus}
                        webvttSubtitles={subtitles}
                        videoElem={videoElem}>
                    </Video>,
                    netflixPlayer
                )
            }
        </>
    );
}

export default VideoContainer;