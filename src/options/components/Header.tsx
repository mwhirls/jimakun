import React from "react";

function Header() {
    return (
        <div className="border border-b border-solid border-slate-200">
            <div className="flex flex-row items-center gap-4 ml-8 my-8">
                <img src='icons/icon32.png'></img>
                <h2 className="text-4xl font-bold">Jimakun</h2>
            </div>
        </div>
    )
}

export default Header;