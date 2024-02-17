import { useState, useEffect } from "react";
import { querySelectorMutation, ChildMutationType } from "../util/util";

// todo: investigate performance of these kinds of hooks.  currently using more than 
// one MutationObserver just to keep things modular, which is probably not efficient.  maybe combine them and broadcast out state changes in a better way

const NETFLIX_BOTTOM_CONTROLS_CLASS = 'watch-video--bottom-controls-container';

export function useNetflixControls(): Element | null {
    const [controlsElem, setControlsElem] = useState(document.querySelector(`.${NETFLIX_BOTTOM_CONTROLS_CLASS}`));

    useEffect(() => {
        // Get handles to Netflix DOM elements
        const netflixObserver = new MutationObserver((mutationsList: MutationRecord[]) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const controls = querySelectorMutation(mutation, `.${NETFLIX_BOTTOM_CONTROLS_CLASS}`);
                    if (controls) {
                        setControlsElem(controls.type === ChildMutationType.Added ? controls.elem : null);
                    }
                }
            }
        });
        const config = { attributes: true, attibuteFilter: ['style'], childList: true, subtree: true };
        netflixObserver.observe(document.body, config);

        return () => {
            netflixObserver.disconnect();
        };
    }, []);

    return controlsElem;
}