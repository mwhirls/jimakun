import React from 'react';
import { IntermediateForm } from '../../../../common/lang';

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

export default InteractiveConjugation;