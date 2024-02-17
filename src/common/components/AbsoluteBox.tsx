import React from "react";
export type PointerEvents = 'pointer-events-none' | 'pointer-events-auto';
export type ZIndex = 'z-0' | 'z-10' | 'z-20' | 'z-30' | 'z-40' | 'z-50' | 'z-auto';

export interface AbsoluteBoxProps {
    rect: DOMRect;
    pointerEvents: PointerEvents;
    zIndex: ZIndex;
    children?: React.ReactNode;
}

function AbsoluteBox({ rect, pointerEvents = 'pointer-events-auto', zIndex = 'z-auto', children }: AbsoluteBoxProps) {
    const style = {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
    };

    return (
        <div className={`absolute ${pointerEvents} ${zIndex}`} style={style}>
            {children}
        </div>
    )
}

export default AbsoluteBox;