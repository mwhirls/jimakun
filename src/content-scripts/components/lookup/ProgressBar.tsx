import React, { useEffect, useState } from 'react';

export interface ProgressBarProps {
    id: string;
    label: string;
    maxValue: number;
    units: string;
}

function ProgressBar({ id, label, maxValue, units }: ProgressBarProps) {
    const [value, setValue] = useState<number>(0);

    // TEMP
    const onClick = (increment: number) => {
        setValue(prev => prev + increment);
    }

    const safeValue = Math.min(value, maxValue);
    const complete = safeValue >= maxValue;
    const progressText = complete ? 'Complete!' : `In progress | ${safeValue} / ${maxValue} ${units}`;
    const color = complete ? 'bg-green' : 'bg-blue';

    return (
        <>
            <label htmlFor={id} className='font-normal text-4xl'>{label}</label>
            <progress id={id} value={safeValue} max={maxValue} className={`${color}`} onClick={() => onClick(10)}></progress>
            <span className="text-slate-400 text-3xl font-light">{progressText}</span>
        </>
    );
}
export default ProgressBar;
