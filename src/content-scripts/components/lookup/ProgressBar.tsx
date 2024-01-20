import React from 'react';
import './ProgressBar.css'
import { Determinate, Progress, ProgressType } from '../../../util/progress';

function IndeterminateProgress({ id }: { id: string }) {
    return <>
        <div id={id} className="rounded-full bg-slate-300 h-4 overflow-hidden">
            <div className='rounded-full w-full h-full bg-blue-600 indeterminate'></div>
        </div>
    </>
}

interface DeterminateProgressProps {
    id: string;
    progress: Determinate;
    units: string;
}

function DeterminateProgress({ id, progress, units }: DeterminateProgressProps) {
    const safeValue = Math.min(progress.value, progress.max);
    const complete = safeValue >= progress.max;
    const progressText = complete ? 'Complete!' : `In progress | ${safeValue} / ${progress.max} ${units}`;
    const bgColor = complete ? 'bg-green-600' : 'bg-blue-600';
    const valueStyle = {
        width: `${Math.min(100, safeValue / progress.max * 100)}%`
    };
    const shimmer = !complete ? 'shimmer' : '';

    return (
        <>
            <div id={id} className="rounded-full bg-slate-300 h-4 overflow-hidden">
                <div style={valueStyle} className={`transition-all ${bgColor} rounded-full h-full ${shimmer}`}></div>
            </div>
            <span className="text-slate-400 text-2xl font-light">{progressText}</span>
        </>
    );
}

export interface ProgressBarProps {
    id: string;
    label: string;
    progress: Progress;
    units: string;
}

function ProgressBar({ id, label, progress, units }: ProgressBarProps) {
    return (
        <div>
            <label htmlFor={id} className='font-normal text-3xl'>{label}</label>
            {
                progress.type === ProgressType.Determinate ?
                    <DeterminateProgress id={id} progress={progress} units={units}></DeterminateProgress> :
                    <IndeterminateProgress id={id}></IndeterminateProgress>
            }
        </div>
    );
}
export default ProgressBar;
