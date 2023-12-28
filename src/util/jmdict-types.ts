import { JMdictSense } from "@scriptin/jmdict-simplified-types";

export enum JMDictPOS {
    AdjectiveFormal = "adj-f",
    AdjectiveI = "adj-i",
    AdjectiveIxr = "adj-ix",
    AdjectiveKari = "adj-kari",
    AdjectiveKu = "adj-ku",
    AdjectiveNa = "adj-na",
    AdjectiveNari = "adj-nari",
    AdjectiveNo = "adj-no",
    AdjectivePreNoun = "adj-pn",
    AdjectiveShiku = "adj-shiku",
    AdjectiveTaru = "adj-t",
    Adverb = "adv",
    AdverbTo = "adv-to",
    Auxiliary = "aux",
    AuxiliaryAdjective = "aux-adj",
    AuxiliaryVerb = "aux-v",
    Conjunction = "conj",
    Copula = "cop",
    Counter = "ctr",
    Expression = "exp",
    Interjection = "int",
    Noun = "n",
    NounAdverbial = "n-adv",
    NounProper = "n-pr",
    NounPrefix = "n-pref",
    NounSuffix = "n-suf",
    NounTemporal = "n-t",
    Number = "num",
    Pronoun = "pn",
    Prefix = "pref",
    Particle = "prt",
    Suffix = "suf",
    Unclassified = "unc",
    VerbUnspecified = "v-unspec",
    Verb1 = "v1",
    Verb1Kureru = "v1-s",
    Verb2AruSuru = "v2a-s",
    Verb2BikuKuru = "v2b-k",
    Verb2BiruSuru = "v2b-s",
    Verb2DakuKuru = "v2d-k",
    Verb2DaruSuru = "v2d-s",
    Verb2GakuKuru = "v2g-k",
    Verb2GasuSuru = "v2g-s",
    Verb2HikuKuru = "v2h-k",
    Verb2HasuSuru = "v2h-s",
    Verb2KakuKuru = "v2k-k",
    Verb2KasuSuru = "v2k-s",
    Verb2MikuKuru = "v2m-k",
    Verb2MisasuSuru = "v2m-s",
    Verb2NasuSuru = "v2n-s",
    Verb2RakuKuru = "v2r-k",
    Verb2RasuSuru = "v2r-s",
    Verb2SasuSuru = "v2s-s",
    Verb2TakuKuru = "v2t-k",
    Verb2TasuSuru = "v2t-s",
    Verb2WakuSuru = "v2w-s",
    Verb2YakuKuru = "v2y-k",
    Verb2YasuSuru = "v2y-s",
    Verb2ZasuSuru = "v2z-s",
    Verb4Biku = "v4b",
    Verb4Gozu = "v4g",
    Verb4Hiku = "v4h",
    Verb4Kiku = "v4k",
    Verb4Miku = "v4m",
    Verb4Neru = "v4n",
    Verb4Reru = "v4r",
    Verb4Su = "v4s",
    Verb4Taru = "v4t",
    Verb5Aru = "v5aru",
    Verb5Biru = "v5b",
    Verb5Gozaru = "v5g",
    Verb5Iku = "v5k",
    Verb5KuruSuru = "v5k-s",
    Verb5Miru = "v5m",
    Verb5Nasu = "v5n",
    Verb5Riru = "v5r",
    Verb5RiIru = "v5r-i",
    Verb5Sasu = "v5s",
    Verb5Taru = "v5t",
    Verb5U = "v5u",
    Verb5USpecial = "v5u-s",
    Verb5Uru = "v5uru",
    VerbIntransitive = "vi",
    VerbKuru = "vk",
    VerbNu = "vn",
    VerbIrregularRu = "vr",
    VerbSuru = "vs",
    VerbSuruClassical = "vs-c",
    VerbSuruIncluded = "vs-i",
    VerbSuruSpecial = "vs-s",
    VerbTransitive = "vt",
    VerbZuru = "vz",
    Unknown = '',
}

export function getPartsOfSpeech(sense: JMdictSense): JMDictPOS[] {
    return sense.partOfSpeech.map((value) => {
        const pos = Object.values(JMDictPOS).find(x => value === x) ?? JMDictPOS.Unknown;
        if (pos === JMDictPOS.Unknown) {
            console.error('unrecognized part of speech', value);
        }
        return pos;
    });
}