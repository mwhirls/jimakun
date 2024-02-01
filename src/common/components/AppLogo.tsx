import React from "react";
import AppIcon from '../../../public/assets/app-icon.svg'

export interface AppLogoProps {
    className?: string;
}

function AppLogo({ className }: AppLogoProps) {
    return (
        <div className={`${className}`}>
            <AppIcon className="h-full w-auto aspect-square inline-block"></AppIcon>
            <span className="ml-4 inline-block text-black font-bold align-middle">Jimakun</span>
        </div>
    )

}

export default AppLogo;