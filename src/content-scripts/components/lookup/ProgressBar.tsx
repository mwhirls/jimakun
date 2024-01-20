import React from 'react';
import './ProgressBar.css'
import { Determinate, Progress, ProgressType } from '../../../common/progress';

function IndeterminateProgress() {
    return <>
        <div className="rounded-full bg-slate-300 h-4 overflow-hidden">
            <div className='rounded-full w-full h-full bg-blue-600 indeterminate'></div>
        </div>
    </>
}

interface DeterminateProgressProps {
    progress: Determinate;
    units: string;
}

function DeterminateProgress({ progress, units }: DeterminateProgressProps) {
    const safeValue = Math.min(progress.value, progress.max);
    const complete = safeValue >= progress.max;
    const progressText = complete ? 'Complete!' : `In progress | ${safeValue} / ${progress.max} ${units}`;
    const bgColor = complete ? 'bg-green-600' : 'bg-blue-600';
    const valueStyle = {
        width: `${Math.min(100, safeValue / progress.max * 100)}%`
    };
    const shimmer = !complete ? 'shimmer' : '';

    return (
        <div>
            <div className="rounded-full bg-slate-300 h-4 overflow-hidden">
                <div style={valueStyle} className={`transition-all ${bgColor} rounded-full h-full ${shimmer}`}></div>
            </div>
            <span className="text-slate-400 text-2xl font-light">{progressText}</span>
        </div>
    );
}

export interface ProgressBarProps {
    progress: Progress;
    units: string;
}

function ProgressBar({ progress, units }: ProgressBarProps) {
    return (
        <div className='w-full'>
            {
                progress.type === ProgressType.Determinate ?
                    <DeterminateProgress progress={progress} units={units}></DeterminateProgress> :
                    <IndeterminateProgress></IndeterminateProgress>
            }
        </div>
    );
}
export default ProgressBar;
