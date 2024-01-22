import React from "react";
import './Spinner.css'

// Pure CSS spinner from: https://loading.io/css/

interface SpinnerProps {
    color?: string;
    thickness?: number;
}

function Spinner({ color, thickness }: SpinnerProps) {
    const leftColor = color ?? 'white';
    const borderWidthPx = thickness ?? 8;
    const style = {
        borderColor: `${leftColor} transparent transparent transparent`,
        borderWidth: `${borderWidthPx}px`
    };
    return (
        <div className='lds-ring'>
            <div style={style}></div>
            <div style={style}></div>
            <div style={style}></div>
            <div style={style}></div>
        </div>
    );
}
export default Spinner;