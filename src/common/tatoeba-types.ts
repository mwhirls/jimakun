export interface TanakaCorpus {
    sentences: TatoebaSentence[]
}

export interface TatoebaSentence {
    id: string;
    text: string;
    translation: string;
    words: TatoebaWord[];
}

export interface TatoebaWord {
    headword: string;
    reading?: string;
    sense?: number;
    surfaceForm?: string;
    checked?: boolean;
}
