import { useState, useEffect } from "react";
import { querySelectorMutation } from "../util/util";

// todo: investigate performance of these kinds of hooks.  currently using more than 
// one MutationObserver just to keep things modular, which is probably not efficient.  maybe combine them and broadcast out state changes in a better way

const NETFLIX_PLAYER_CLASS = "watch-video--player-view";
const NETFLIX_VIDEO_CLASS = `${NETFLIX_PLAYER_CLASS} video`

export function useNetflixPlayer(): [Element | null, HTMLVideoElement | null] {
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
                    setVideoElem(video.type === 'added' ? video.elem as HTMLVideoElement : null);
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

    return [netflixPlayer, videoElem];
}