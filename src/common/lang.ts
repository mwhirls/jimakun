import * as bunsetsu from "bunsetsu";

export function toHiragana(text: string | undefined): string {
    if (!text) {
        return "";
    }
    const result = [];
    for (let i = 0; i < text.length; i++) {
        const code = text.codePointAt(i);
        if (code && code >= 0x30A1 && code <= 0x30F6) { // katakana 
            result.push(String.fromCodePoint(code - 0x60));
        } else if (code && code >= 0x3041 && code <= 0x3096) { // hiragana
            result.push(text.charAt(i));
        }
    }
    return result.join('');
}

// https://stackoverflow.com/questions/15033196/using-javascript-to-check-whether-a-string-contains-japanese-characters-includi
export function isKanji(char: string) {
    if (char.length !== 1) {
        return false;
    }
    const code = char.codePointAt(0);
    return (code && code >= 0x4e00 && code <= 0x9faf) || // CJK (common & uncommon) 
        (code && code >= 0x3400 && code <= 0x4dbf);  // CJK Ext. A (rare)
}

export function extractKanji(word: string): string[] {
    const chars = word.split('');
    return chars.filter(c => isKanji(c));
}

export function isSuruVerb(word: bunsetsu.Word): boolean {
    if (word.tokens.length < 2) {
        return false;
    }
    const t0 = word.tokens[0];
    const t1 = word.tokens[1];
    return t0.pos === bunsetsu.PartOfSpeech.Noun &&
        t1.baseForm === 'する';
}

// todo: don't use plain enums here
export enum TokenType {
    AdverbialForm,
    Ageru,
    DictionaryForm,
    Conditional,
    Continuative,
    Imperative,
    Kureru,
    Kuru,
    Masu,
    Morau,
    NaiForm,
    Passive,
    PassivePotential,
    PastTense,
    ProgressiveForm,
    Suru,
    Tara,
    TeForm,
    Tsudukeru,
    Unknown,
}

export function getTokenType(token: bunsetsu.Token) {
    switch (token.baseForm) {
        case 'て':
            return TokenType.TeForm;
        case 'くる':
            return TokenType.Kuru;
        case 'た': {
            if (token.surfaceForm === 'たら') {
                return TokenType.Tara;
            }
            return TokenType.PastTense;
        }
        case 'かった': {
            if (token.surfaceForm === 'かったら') {
                return TokenType.Tara;
            }
            return TokenType.PastTense;
        }
        case 'くれる':
            return TokenType.Kureru;
        case 'あげる':
            return TokenType.Ageru;
        case 'もらう':
        case 'もらえる':
            return TokenType.Morau;
        case 'られる':
            return TokenType.PassivePotential;
        case 'れる':
            return TokenType.Passive;
        case 'ます':
            return TokenType.Masu;
        case 'ない':
            return TokenType.NaiForm;
        case 'ば':
            return TokenType.Conditional;
        case 'する':
            return TokenType.Suru;
        case 'てる':
        case 'いる':
            return TokenType.ProgressiveForm;
    }
    return TokenType.Unknown;
}

export interface IntermediateForm {
    type: TokenType;
    baseForm?: string;
    surfaceForm: string;
    token?: bunsetsu.Token;
}

function getIntermediateForm(word: bunsetsu.Word, token: bunsetsu.Token, inflected: boolean, prev?: IntermediateForm) {
    const type = prev ? getTokenType(token) : TokenType.DictionaryForm;
    const baseForm = prev ? prev.surfaceForm + token.baseForm : token.baseForm;
    const surfaceForm = prev ? prev.surfaceForm + token.surfaceForm : token.surfaceForm;
    return {
        type,
        baseForm,
        surfaceForm,
        token: inflected ? undefined : token,
    };
}

function getInflection(token: bunsetsu.Token, prev?: IntermediateForm): IntermediateForm | undefined {
    const detail = token.detail;
    if (detail?.type !== "ConjugationDetail") {
        return;
    }
    const conjugatedForm = detail.conjugatedForm;
    const getType = () => {
        switch (conjugatedForm) {
            case bunsetsu.ConjugatedForm.ImperativeE:
                return TokenType.Imperative;
            case bunsetsu.ConjugatedForm.ImperativeRo:
                return TokenType.Imperative;
            case bunsetsu.ConjugatedForm.TeConjunction: {
                if (token.pos === bunsetsu.PartOfSpeech.iAdjective) {
                    return TokenType.AdverbialForm;
                }
                return TokenType.Unknown;
            }
            default:
                return TokenType.Unknown;
        }
    };
    const type = getType();
    if (type === TokenType.Unknown) {
        return;
    }
    const surfaceForm = prev ? prev.surfaceForm + token.surfaceForm : token.surfaceForm;
    return {
        type,
        surfaceForm,
        token,
    }
}

export function getIntermediateForms(word: bunsetsu.Word): IntermediateForm[] {
    if (!word.tokens.length) {
        return [];
    }
    const forms: IntermediateForm[] = [];
    let p0 = -1;
    let p1 = 0;
    while (p1 < word.tokens.length) {
        const prev = p0 >= 0 ? forms[p0] : undefined;
        const curr = word.tokens[p1];
        const inflection = getInflection(curr, prev);
        const form = getIntermediateForm(word, curr, !!inflection, prev);
        forms.push(form);
        if (inflection) {
            forms.push(inflection);
        }
        p0++;
        p1++;
    }
    return forms;
}