import React, { useState } from 'react';
import * as bunsetsu from "bunsetsu";
import { ArrowLongRightIcon } from '@heroicons/react/24/outline'

enum Inflection {
    Dictionary,
    Te,
    Past,
    Kuru,
    Kureru,
    Ageru,
    Morau,
    Continuative,
    Unknown,
}

interface IntermediateForm {
    baseForm: string;
    surfaceForm: string;
    tokenBaseForm: string;
    tokenSurfaceForm: string;
    inflection: Inflection;
}

function getInfoText(inflection: Inflection) {
    switch (inflection) {
        case Inflection.Dictionary:
            return 'dictionary form';
        case Inflection.Te:
            return 'て form';
        case Inflection.Past:
            return 'past tense';
        case Inflection.Kuru:
            return 'くる auxillary verb - to come to be; to become; to get; to grow; to continue';
        case Inflection.Kureru:
            return "くれる auxiliary verb - to do for one; to take the trouble to do​; to do to someone's disadvantage";
        case Inflection.Ageru:
            return "あげる auxiliary verb - to do for (the sake of someone else​)";
        case Inflection.Morau:
            return "もらう auxillary verb - to get someone to do something​";
    }
    return 'unknown inflection'
}

function getInflection(token: bunsetsu.Token) {
    switch (token.baseForm) {
        case 'て':
            return Inflection.Te;
        case 'くる':
            return Inflection.Kuru;
        case 'た':
        case 'かった':
            return Inflection.Past;
        case 'くれる':
            return Inflection.Kureru;
        case 'あげる':
            return Inflection.Ageru;
        case 'もらう':
            return Inflection.Morau;
    }
    return Inflection.Unknown;
}

function getDictionaryForm(word: bunsetsu.Word) {
    const curr = word.tokens[0];
    const next = word.tokens.length >= 2 ? word.tokens[1] : undefined;
    const inflection = Inflection.Dictionary;
    if (!next || next.surfaceForm !== 'する') {
        return {
            baseForm: curr.baseForm,
            surfaceForm: curr.surfaceForm,
            tokenBaseForm: curr.baseForm,
            tokenSurfaceForm: curr.surfaceForm,
            inflection,
            tokens: [curr]
        };
    }
    return {
        baseForm: curr.surfaceForm + next.baseForm,
        surfaceForm: curr.surfaceForm + next.surfaceForm,
        tokenBaseForm: curr.surfaceForm + next.baseForm,
        tokenSurfaceForm: curr.surfaceForm + next.surfaceForm,
        inflection,
        tokens: [curr, next],
    };
}

function getIntermediateForms(word: bunsetsu.Word): IntermediateForm[] {
    if (!word.tokens.length) {
        return [];
    }
    const dictionaryForm = getDictionaryForm(word);
    const forms = [dictionaryForm];
    let p0 = dictionaryForm.tokens.length - 1;
    let p1 = p0 + 1;
    while (p1 < word.tokens.length) {
        const prev = forms[p0];
        const curr = word.tokens[p1];
        const baseForm = prev.surfaceForm + curr.baseForm;
        const surfaceForm = prev.surfaceForm + curr.surfaceForm;
        const inflection = getInflection(curr);
        const form = {
            baseForm,
            surfaceForm,
            tokenBaseForm: curr.baseForm,
            tokenSurfaceForm: curr.surfaceForm,
            inflection,
            tokens: [curr],
        };
        forms.push(form);
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
                    return (
                        <button key={index} className={`inline-block text-5xl rounded-lg hover:bg-blue-400 hover:bg-opacity-50 ${color}`} onClick={() => setSelectedIndex(index)}>{form.tokenSurfaceForm}</button>
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
                    return (
                        <li key={index} className='leading-[0]'>
                            {index > 0 && <ArrowLongRightIcon className='w-8 inline-block mx-4 text-slate-500'></ArrowLongRightIcon>}
                            <button className={`inline-block p-2 text-2xl rounded-lg drop-shadow  ${buttonColor} ${textColor}`} onClick={() => setSelectedIndex(index)}>
                                <div className={`text-2xl`}>{form.baseForm}</div>
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
    const infoText = getInfoText(selectedForm.inflection);
    return (
        <div className='leading-none my-4'>
            <span className='inline-block text-3xl text-black font-normal'>{selectedForm.baseForm}</span>
            <span className='ml-4 text-2xl text-slate-400 font-normal'>{infoText}</span>
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
