import React from "react";
import AppIcon from '../../../public/assets/app-icon.svg'

function Header() {
    return (
        <div className="border-b border-solid border-slate-200">
            <div className="w-4/5 max-w-[175rem] my-8 mx-auto">
                <AppIcon className="w-16 h-16 inline-block"></AppIcon>
                <h2 className="inline ml-4 text-3xl font-bold align-middle">Jimakun</h2>
            </div>
        </div>
    )
}

export default Header;