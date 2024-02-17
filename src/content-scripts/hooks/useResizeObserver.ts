import { useEffect, useState } from "react";

// https://stackoverflow.com/questions/17056654/getting-the-real-html5-video-width-and-height
function calculateViewRect(video: HTMLVideoElement): DOMRect {
    const videoRatio = video.videoWidth / video.videoHeight;
    let width = video.offsetWidth;
    let height = video.offsetHeight;
    const elementRatio = width / height;

    if (elementRatio > videoRatio) {
        width = height * videoRatio;
    } else {
        height = width / videoRatio;
    }

    const rect = video.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const left = centerX - width / 2;
    const top = centerY - height / 2;

    return new DOMRect(
        left,
        top,
        width,
        height,
    );
}

export function useResizeObserver(videoElem: HTMLVideoElement) {
    const [rect, setRect] = useState(calculateViewRect(videoElem));

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target.tagName === 'VIDEO') {
                    const newRect = calculateViewRect(entry.target as HTMLVideoElement);
                    setRect(newRect);
                } else {
                    console.warn(`[JIMAKUN] resize event handled for unknown element ${entry}`);
                }
            }
        });
        resizeObserver.observe(videoElem);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return rect;
}