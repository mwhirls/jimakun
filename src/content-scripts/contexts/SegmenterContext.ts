
import { createContext } from 'react';
import { Segmenter } from 'tokun';

interface SegmenterContextI {
    segmenter: Segmenter | null
}

export const SegmenterContext = createContext<SegmenterContextI>({
    segmenter: null,
});