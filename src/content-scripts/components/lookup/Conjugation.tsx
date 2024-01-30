import React, { useState } from 'react';
import * as bunsetsu from "bunsetsu";
import { ArrowLongRightIcon } from '@heroicons/react/24/outline'

enum Inflection {
    Dictionary,
    Te,
    Past,
    Kuru,
    Continuative,
    Unknown,
}

interface IntermediateForm {
    baseForm: string;
    surfaceForm: string;
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
            return 'くる auxillary verb (to come to be; to become; to get; to grow; to continue)';
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
            inflection,
            tokens: [curr]
        };
    }
    return {
        baseForm: curr.surfaceForm + next.baseForm,
        surfaceForm: curr.surfaceForm + next.surfaceForm,
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
            inflection,
            tokens: [curr],
        };
        forms.push(form);
        p0++;
        p1++;
    }
    return forms;
}

export interface ConjugationProps {
    word: bunsetsu.Word;
}

function Conjugation({ word }: ConjugationProps) {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const forms = getIntermediateForms(word);
    const selectedForm = forms[selectedIndex];
    const infoText = getInfoText(selectedForm.inflection);
    return (
        <>
            <div className='mx-auto text-5xl my-8 text-center text-black font-normal bg-white'>{word.surfaceForm}</div>
            <div className='my-8 mx-auto text-3xl text-center text-slate-400 font-normal'>{infoText}</div>
            <ul className='p-4 flex flex-row flex-wrap gap-y-2 items-center rounded-lg bg-slate-100 w-full leading-none shadow-inner border border-solid border-gray-200'>
                {
                    forms.map((form, index) => {
                        const selected = selectedIndex === index;
                        const buttonColor = selected ? 'bg-red-700' : 'bg-white';
                        const textColor = selected ? 'text-white font-bold' : 'text-slate-800 font-normal hover:text-black hover:font-bold';
                        return (
                            <li key={index} className='leading-[0]'>
                                {index > 0 && <ArrowLongRightIcon className='w-12 inline-block mx-4 text-slate-500'></ArrowLongRightIcon>}
                                <button className={`inline-block p-2 text-2xl rounded-lg drop-shadow active:bg-gray-200 ${buttonColor} ${textColor}`} onClick={() => setSelectedIndex(index)}>
                                    <div className={`text-2xl`}>{form.baseForm}</div>
                                </button>
                            </li>
                        );
                    })
                }
            </ul>
        </>
    );
}
export default Conjugation;
