import React, { useEffect, useState } from 'react';
import './ProgressBar.css'

export interface ProgressBarProps {
    id: string;
    label: string;
    value: number;
    maxValue: number;
    units: string;
}

function ProgressBar({ id, label, value, maxValue, units }: ProgressBarProps) {
    const safeValue = Math.min(value, maxValue);
    const complete = safeValue >= maxValue;
    const progressText = complete ? 'Complete!' : `In progress | ${safeValue} / ${maxValue} ${units}`;
    const bgColor = complete ? 'bg-green-600' : 'bg-blue-600';
    const valueStyle = {
        width: `${Math.min(100, safeValue / maxValue * 100)}%`
    };
    const shimmer = !complete ? 'shimmer' : '';

    return (
        <div className="leading-tight">
            <label htmlFor={id} className='font-normal text-3xl'>{label}</label>
            <div className="rounded-full bg-slate-300 h-4 overflow-hidden">
                <div style={valueStyle} className={`transition-all ${bgColor} rounded-full h-full ${shimmer}`}></div>
            </div>
            <span className="text-slate-400 text-2xl font-light">{progressText}</span>
        </div>
    );
}
export default ProgressBar;
