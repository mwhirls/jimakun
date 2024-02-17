import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { StorageType } from "../../storage/storage";
import { querySelectorMutation, ChildMutationType } from "../util/util";
import Video from "./Video";
import { DBStatusResult } from "../../service-worker/database/dbstatus";
import { useStorage } from "../../common/hooks/useStorage";
import { useExtensionEnabled } from "../../common/hooks/useExtensionEnabled";
import { MovieId, useNetflixMetadata } from "../hooks/useNetflixMetadata";

const NETFLIX_PLAYER_CLASS = "watch-video--player-view";
const NETFLIX_VIDEO_CLASS = `${NETFLIX_PLAYER_CLASS} video`
const MOVIE_KEY = 'lastMovieId';

interface VideoContainerProps {
    dbStatus: DBStatusResult | null;
}

function VideoContainer({ dbStatus }: VideoContainerProps) {
    const [currMovie] = useStorage<MovieId | null>(MOVIE_KEY, StorageType.Session, null);
    const [enabled] = useExtensionEnabled(false);
    const [subtitleData, currTrack] = useNetflixMetadata();
    const [netflixPlayer, setNetflixPlayer] = useState<Element | null>(document.querySelector(`.${NETFLIX_PLAYER_CLASS}`));
    const [videoElem, setVideoElem] = useState<HTMLVideoElement | null>(document.querySelector(`.${NETFLIX_VIDEO_CLASS}`) as HTMLVideoElement | null);

    useEffect(() => {
        // We insert our components into the Netflix DOM, but they constantly
        // mutate it.  Watch for changes so we know when to re-render.
        const netflixObserver = new MutationObserver(mutationCallback);
        function mutationCallback(mutationsList: MutationRecord[]) {
            for (const mutation of mutationsList) {
                if (mutation.type !== 'childList') {
                    continue;
                }
                const video = querySelectorMutation(mutation, `.${NETFLIX_VIDEO_CLASS}`);
                if (video) {
                    setVideoElem(video.type === ChildMutationType.Added ? video.elem as HTMLVideoElement : null);
                    const player = document.querySelector(`.${NETFLIX_PLAYER_CLASS}`);
                    setNetflixPlayer(player);
                }
            }
        }
        const config = { attributes: false, childList: true, subtree: true };
        netflixObserver.observe(document.body, config);

        return () => {
            netflixObserver.disconnect();
        };
    }, []);

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
                    <Video dbStatus={dbStatus} webvttSubtitles={subtitles} videoElem={videoElem}></Video>,
                    netflixPlayer
                )
            }
        </>
    );
}

export default VideoContainer;