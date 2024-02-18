import React from 'react';
import { ArrowLongRightIcon } from '@heroicons/react/24/outline';
import { IntermediateForm } from '../../../../common/lang';

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

export default ConjugationVisualizer;