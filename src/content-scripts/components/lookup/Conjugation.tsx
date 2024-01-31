import React, { useState } from 'react';
import * as bunsetsu from "bunsetsu";
import { ArrowLongRightIcon } from '@heroicons/react/24/outline'

enum TokenType {
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
    Suru,
    Tara,
    TeForm,
    Tsudukeru,
    Unknown,
}

interface IntermediateForm {
    type: TokenType;
    baseForm?: string;
    surfaceForm: string;
    token?: bunsetsu.Token;
}

function getInfoText(inflection: TokenType) {
    switch (inflection) {
        case TokenType.DictionaryForm:
            return 'dictionary form';
        case TokenType.Conditional:
            return 'ば conditional form';
        case TokenType.TeForm:
            return 'て form';
        case TokenType.PastTense:
            return 'past tense';
        case TokenType.Imperative:
            return 'imperative form';
        case TokenType.Kuru:
            return 'くる auxillary verb - to come to be; to become; to get; to grow; to continue';
        case TokenType.Kureru:
            return "くれる auxiliary verb - to do for one; to take the trouble to do​; to do to someone's disadvantage";
        case TokenType.Ageru:
            return "あげる auxiliary verb - to do for (the sake of someone else​)";
        case TokenType.Masu:
            return 'polite form';
        case TokenType.Morau:
            return "もらう auxillary verb - to get someone to do something​";
        case TokenType.NaiForm:
            return 'negative form';
        case TokenType.Passive:
            return 'indicates passive voice (incl. the "suffering passive")';
        case TokenType.PassivePotential:
            return '1. indicates passive voice (incl. the "suffering passive"); 2. indicates the potential form'
        case TokenType.Suru:
            return 'dictionary form (suru-verb)';
        case TokenType.Tara:
            return 'たら conditional form';
        case TokenType.Tsudukeru:
            return '続ける auxillary verb - to continue; to keep up; to keep on';
    }
    return 'unknown form'
}

function getTokenType(token: bunsetsu.Token) {
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
    }
    return TokenType.Unknown;
}

function getIntermediateForm(word: bunsetsu.Word, token: bunsetsu.Token, inflected: boolean, prev?: IntermediateForm) {
    let type = getTokenType(token);
    if (type === TokenType.Unknown && word.baseForm === token.baseForm) {
        type = TokenType.DictionaryForm;
    }
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
    if (detail?.type !== bunsetsu.DetailType.ConjugationDetail) {
        return;
    }
    const conjugatedForm = detail.conjugatedForm;
    const getType = () => {
        switch (conjugatedForm) {
            case bunsetsu.ConjugatedForm.ImperativeE:
                return TokenType.Imperative;
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

function getIntermediateForms(word: bunsetsu.Word): IntermediateForm[] {
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

interface InteractiveConjugationProps {
    forms: IntermediateForm[];
    selectedIndex: number;
    setSelectedIndex: (index: number) => void;
}

function InteractiveConjugation({ forms, selectedIndex, setSelectedIndex }: InteractiveConjugationProps) {
    return (
        <div className='mx-auto text-center w-fit'>
            {
                forms.map((form, index) => {
                    const selected = selectedIndex >= index;
                    const color = selected ? 'text-black font-bold' : 'text-slate-400 font-bold active:bg-gray-300';
                    const text = form.token?.surfaceForm;
                    return (
                        <button key={index} className={`inline-block text-5xl rounded-lg hover:bg-blue-400 hover:bg-opacity-50 ${color}`} onClick={() => setSelectedIndex(index)}>{text}</button>
                    )
                })
            }
        </div>
    )
}

interface ConjugationVisualizerProps {
    forms: IntermediateForm[];
    selectedIndex: number;
    setSelectedIndex: (index: number) => void;
}

function ConjugationVisualizer({ forms, selectedIndex, setSelectedIndex }: ConjugationVisualizerProps) {
    return (
        <ul className='my-4 p-4 flex flex-row flex-wrap gap-y-2 items-center rounded-lg bg-slate-100 w-full leading-none shadow-inner border border-solid border-gray-200'>
            {
                forms.map((form, index) => {
                    const selected = selectedIndex === index;
                    const buttonColor = selected ? 'bg-red-700' : 'bg-white hover:bg-gray-100 active:bg-gray-200';
                    const textColor = selected ? 'text-white font-bold' : 'text-slate-800 font-normal';
                    const text = form.baseForm ?? form.surfaceForm;
                    return (
                        <li key={index} className='leading-[0]'>
                            {index > 0 && <ArrowLongRightIcon className='w-8 inline-block mx-4 text-slate-500'></ArrowLongRightIcon>}
                            <button className={`inline-block p-2 text-2xl rounded-lg drop-shadow  ${buttonColor} ${textColor}`} onClick={() => setSelectedIndex(index)}>
                                <div className={`text-2xl`}>{text}</div>
                            </button>
                        </li>
                    );
                })
            }
        </ul>
    )
}

export interface InfoTextProps {
    forms: IntermediateForm[];
    selectedIndex: number;
}

function InfoText({ forms, selectedIndex }: InfoTextProps) {
    const selectedForm = forms[selectedIndex];
    const infoText = getInfoText(selectedForm.type);
    const label = selectedForm.baseForm ?? selectedForm.surfaceForm;
    return (
        <div className='leading-none my-4'>
            <span className='inline-block text-3xl text-black font-normal'>{label}</span>
            <span className='ml-4 text-3xl text-slate-400 font-normal'>{infoText}</span>
        </div>
    )
}

export interface ConjugationProps {
    word: bunsetsu.Word;
}

function Conjugation({ word }: ConjugationProps) {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const forms = getIntermediateForms(word);
    return (
        <>
            <InteractiveConjugation forms={forms} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex}></InteractiveConjugation>
            <ConjugationVisualizer forms={forms} selectedIndex={selectedIndex} setSelectedIndex={(index) => setSelectedIndex(index)}></ConjugationVisualizer>
            <InfoText forms={forms} selectedIndex={selectedIndex}></InfoText>
        </>
    );
}
export default Conjugation;
