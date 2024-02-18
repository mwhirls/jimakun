import React from 'react';
import { TokenType, IntermediateForm } from '../../../../common/lang';

function getInfoText(inflection: TokenType) {
    switch (inflection) {
        case TokenType.AdverbialForm:
            return 'adverbial form';
        case TokenType.DictionaryForm:
            return 'dictionary form';
        case TokenType.Conditional:
            return 'ば conditional form';
        case TokenType.TeForm:
            return 'て form';
        case TokenType.PastTense:
            return 'past tense';
        case TokenType.ProgressiveForm:
            return 'progressive form - to be ...-ing; to have been ...-ing';
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

export default InfoText;