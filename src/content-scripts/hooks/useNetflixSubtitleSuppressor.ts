import { useState, useEffect } from "react";

// todo: investigate performance of these kinds of hooks.  currently using more than 
// one MutationObserver just to keep things modular, which is probably not efficient.  maybe combine them and broadcast out state changes in a better way

const NETFLIX_TEXT_SUBTITLE_CLASS = "player-timedtext";
const NETFLIX_IMAGE_SUBTITLE_CLASS = "image-based-timed-text";

class StyledNode {
    element: HTMLElement;
    style: CSSStyleDeclaration;

    constructor(element: HTMLElement) {
        this.element = element;
        this.style = element.style;
    }

    show(show: boolean) {
        if (this.element) {
            this.element.style.visibility = show ? this.element.style.visibility : 'hidden';
        }
    }
}

function queryStyledNode(selector: string) {
    const elem = document.querySelector(selector);
    return elem ? new StyledNode(elem as HTMLElement) : null;
}

export function useNetflixSubtitleSuppressor() {
    const [timedTextElem, setTimedTextElem] = useState<StyledNode | null>(queryStyledNode(NETFLIX_TEXT_SUBTITLE_CLASS));
    const [imageTimedTextElem, setImageTimedTextElem] = useState<StyledNode | null>(queryStyledNode(NETFLIX_IMAGE_SUBTITLE_CLASS));

    useEffect(() => {
        // Get handles to relevant Netflix DOM elements
        const netflixObserver = new MutationObserver((mutationsList: MutationRecord[]) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes') {
                    if (!(mutation.target instanceof Element)) {
                        continue;
                    }
                    // hide original Netflix subtitles
                    const node = new StyledNode(mutation.target as HTMLElement);
                    if (node.element.className === NETFLIX_TEXT_SUBTITLE_CLASS) {
                        node.show(false);
                        setTimedTextElem(node);
                    } else if (node.element.className === NETFLIX_IMAGE_SUBTITLE_CLASS) {
                        node.show(false);
                        setImageTimedTextElem(node);
                    }
                }
            }
        });
        const config = { attributes: true, attibuteFilter: ['style'], childList: true, subtree: true };
        netflixObserver.observe(document.body, config);

        const hideNetflixSubtitles = () => {
            const timedText = queryStyledNode(`.${NETFLIX_TEXT_SUBTITLE_CLASS}`);
            timedText?.show(false);
            setTimedTextElem(timedTextElem);
            const imageTimedText = queryStyledNode(`.${NETFLIX_IMAGE_SUBTITLE_CLASS}`);
            imageTimedText?.show(false);
            setImageTimedTextElem(imageTimedText);
        };
        hideNetflixSubtitles();

        return () => {
            netflixObserver.disconnect();
            const showNetflixSubtitles = () => {
                timedTextElem?.show(true);
                imageTimedTextElem?.show(true);
            };
            showNetflixSubtitles();
        };
    }, []);
}