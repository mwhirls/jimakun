import { TatoebaSentence } from "./tatoeba-types";
import { z } from "zod";

export const RuntimeEvent = z.enum([
    "CountKanji",
    "CountSentences",
    "LookupKanji",
    "LookupSentences",
    "LookupWords",
    "MetadataDetected",
    "PlayAudio",
    "PurgeDictionaries",
    "SubtitleTrackSwitched",
    "SeekCue",
    "SeekTime",
    "ToggleSubs",
    "OpenOptions"
] as const);

export const RuntimeMessage = z.object({
    event: RuntimeEvent,
    data: z.any()
})

export const SeekDirection = z.enum([
    "Next",
    "Repeat",
    "Previous",
] as const)

export const SeekCueMessage = z.object({
    direction: SeekDirection
})

export const SeekTimeMessage = z.object({
    startTime: z.number(),
});

export const LookupWordsMessage = z.object({
    words: z.array(z.object({
        surfaceForm: z.string(),
        baseForm: z.string(),
        katakana: z.string(),
        hiragana: z.string(),
    }))
})

export const CountKanjiMessage = z.object({
    kanji: z.array(z.string())
})

export const CountSentencesMessage = z.object({
    searchTerm: z.string()
})

export const LookupSentencesMessage = z.object({
    searchTerm: z.string(),
    page: z.number(),
    perPage: z.number(),
})

const Sentence: z.ZodType<TatoebaSentence> = z.any(); // todo: better validation for this type
export const LookupSentencesResult = z.object({
    sentences: z.array(Sentence),
    pages: z.number(),
})

export const LookupKanjiMessage = z.object({
    kanji: z.array(z.string())
})

export const PlayAudioMessage = z.object({
    utterance: z.string()
})

export type RuntimeEvent = z.infer<typeof RuntimeEvent>;
export type RuntimeMessage = z.infer<typeof RuntimeMessage>;
export type SeekDirection = z.infer<typeof SeekDirection>;
export type SeekCueMessage = z.infer<typeof SeekCueMessage>;
export type SeekTimeMessage = z.infer<typeof SeekTimeMessage>;
export type LookupWordsMessage = z.infer<typeof LookupWordsMessage>;
export type CountKanjiMessage = z.infer<typeof CountKanjiMessage>;
export type CountSentencesMessage = z.infer<typeof CountSentencesMessage>;
export type LookupSentencesMessage = z.infer<typeof LookupSentencesMessage>;
export type LookupSentencesResult = z.infer<typeof LookupSentencesResult>;
export type LookupKanjiMessage = z.infer<typeof LookupKanjiMessage>;
export type PlayAudioMessage = z.infer<typeof PlayAudioMessage>;