export interface TanakaCorpus {
    sentences: CorpusSentence[]
}

export interface CorpusSentence {
    id: string;
    text: string;
    translation: string;
    words: CorpusWord[];
}

export interface CorpusWord {
    headword: string;
    reading?: string;
    sense?: number;
    surfaceForm?: string;
    checked?: boolean;
}
