import React from 'react';
import * as bunsetsu from "bunsetsu";
import { JMdictSense, JMdictWord } from '@scriptin/jmdict-simplified-types';
import { JMDictPOS, getPartsOfSpeech } from '../../../util/jmdict-types';

function getPartOfSpeechInfo(sense: JMdictSense) {
    const partsOfSpeech = getPartsOfSpeech(sense);
    const info: (string | undefined)[] = partsOfSpeech.map((pos) => {
        switch (pos) {
            case JMDictPOS.AdjectiveI:
                return "i-adjective"
            case JMDictPOS.AdjectiveNa:
                return 'na-adjective';
            case JMDictPOS.AdjectiveNo:
                return 'adjective taking "no"';
            case JMDictPOS.AdjectiveIxr:
                return 'adjective (ii/yoi)';
            case JMDictPOS.AdjectiveKari:
            case JMDictPOS.AdjectiveKu:
            case JMDictPOS.AdjectiveNari:
            case JMDictPOS.AdjectiveShiku:
                return 'adjective (archaic)';
            case JMDictPOS.AdjectiveFormal:
                return 'adjective acting prenominally';
            case JMDictPOS.AdjectivePreNoun:
                return 'pre-noun adjectival';
            case JMDictPOS.AdjectiveTaru:
                return '"taru" adjective';
            case JMDictPOS.Adverb:
                return 'adverb';
            case JMDictPOS.AdverbTo:
                return 'adverb taking "to"';
            case JMDictPOS.Auxiliary:
                return 'auxillary';
            case JMDictPOS.AuxiliaryAdjective:
                return 'auxillary adjective';
            case JMDictPOS.AuxiliaryVerb:
                return 'auxillary verb';
            case JMDictPOS.Conjunction:
                return 'conjunction';
            case JMDictPOS.Copula:
                return 'copula';
            case JMDictPOS.Counter:
                return 'counter';
            case JMDictPOS.Expression:
                return 'expression';
            case JMDictPOS.Interjection:
                return 'interjection';
            case JMDictPOS.Noun:
                return 'noun';
            case JMDictPOS.NounAdverbial:
                return 'adverbial noun';
            case JMDictPOS.NounProper:
                return 'proper noun';
            case JMDictPOS.NounPrefix:
                return 'noun (prefix)';
            case JMDictPOS.NounSuffix:
                return 'noun (suffix)';
            case JMDictPOS.NounTemporal:
                return 'temporal noun';
            case JMDictPOS.Number:
                return 'number';
            case JMDictPOS.Pronoun:
                return 'pronoun';
            case JMDictPOS.Prefix:
                return 'prefix';
            case JMDictPOS.Particle:
                return 'particle';
            case JMDictPOS.Suffix:
                return 'suffix';
            case JMDictPOS.Unclassified:
                return 'unclassified';
            case JMDictPOS.VerbUnspecified:
                return 'verb';
            case JMDictPOS.Verb1:
                return 'ichidan verb';
            case JMDictPOS.Verb1Kureru:
                return 'ichidan verb (kureru)';
            case JMDictPOS.Verb2AruSuru:
            case JMDictPOS.Verb2BikuKuru:
            case JMDictPOS.Verb2BiruSuru:
            case JMDictPOS.Verb2DakuKuru:
            case JMDictPOS.Verb2DaruSuru:
            case JMDictPOS.Verb2GakuKuru:
            case JMDictPOS.Verb2GasuSuru:
            case JMDictPOS.Verb2HikuKuru:
            case JMDictPOS.Verb2HasuSuru:
            case JMDictPOS.Verb2KakuKuru:
            case JMDictPOS.Verb2KasuSuru:
            case JMDictPOS.Verb2MikuKuru:
            case JMDictPOS.Verb2MisasuSuru:
            case JMDictPOS.Verb2NasuSuru:
            case JMDictPOS.Verb2RakuKuru:
            case JMDictPOS.Verb2RasuSuru:
            case JMDictPOS.Verb2SasuSuru:
            case JMDictPOS.Verb2TakuKuru:
            case JMDictPOS.Verb2TasuSuru:
            case JMDictPOS.Verb2WakuSuru:
            case JMDictPOS.Verb2YakuKuru:
            case JMDictPOS.Verb2YasuSuru:
            case JMDictPOS.Verb2ZasuSuru:
                return 'nidan verb';
            case JMDictPOS.Verb4Biku:
            case JMDictPOS.Verb4Gozu:
            case JMDictPOS.Verb4Hiku:
            case JMDictPOS.Verb4Kiku:
            case JMDictPOS.Verb4Miku:
            case JMDictPOS.Verb4Neru:
            case JMDictPOS.Verb4Reru:
            case JMDictPOS.Verb4Su:
            case JMDictPOS.Verb4Taru:
                return 'yodan verb';
            case JMDictPOS.Verb5Aru:
            case JMDictPOS.Verb5Biru:
            case JMDictPOS.Verb5Gozaru:
            case JMDictPOS.Verb5Iku:
            case JMDictPOS.Verb5KuruSuru:
            case JMDictPOS.Verb5Miru:
            case JMDictPOS.Verb5Nasu:
            case JMDictPOS.Verb5Riru:
            case JMDictPOS.Verb5RiIru:
            case JMDictPOS.Verb5Sasu:
            case JMDictPOS.Verb5Taru:
            case JMDictPOS.Verb5U:
            case JMDictPOS.Verb5USpecial:
            case JMDictPOS.Verb5Uru:
                return 'godan verb';
            case JMDictPOS.VerbIntransitive:
                return 'intransitive';
            case JMDictPOS.VerbKuru:
                return 'kuru';
            case JMDictPOS.VerbNu:
            case JMDictPOS.VerbIrregularRu:
                return 'irregular verb';
            case JMDictPOS.VerbSuru:
            case JMDictPOS.VerbSuruIncluded:
                return 'suru verb';
            case JMDictPOS.VerbSuruClassical:
                return 'suru verb precursor';
            case JMDictPOS.VerbSuruSpecial:
                return 'suru verb (special class)';
            case JMDictPOS.VerbTransitive:
                return 'transitive';
            case JMDictPOS.VerbZuru:
                return 'ichidan (zuru verb)';
            case JMDictPOS.Unknown:
                return undefined;
            default:
                return undefined;
        }
    });
    const validText = info.filter((value) => value !== undefined);
    return validText.join(', ');
}

export interface DefinitionsProps {
    word: bunsetsu.Word;
    entry: JMdictWord;
}

function Definitions({ word, entry }: DefinitionsProps) {
    return (
        <div>
            {
                entry.sense.map((sense, senseIndex) => {
                    const posInfo = getPartOfSpeechInfo(sense);
                    return (
                        <div key={senseIndex}>
                            <h5 className='text-3xl text-slate-400 font-light'>{posInfo}</h5>
                            {
                                sense.gloss.map((gloss, glossIndex) => {
                                    return (
                                        <p key={glossIndex} className='text-4xl text-black font-normal'>{gloss.text}</p>
                                    )
                                })
                            }
                        </div>
                    );
                })
            }
        </div>
    );
}
export default Definitions;