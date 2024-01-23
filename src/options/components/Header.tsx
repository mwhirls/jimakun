import React from "react";

function Header() {
    return (
        <div className="border-b border-solid border-slate-200">
            <div className="w-4/5 max-w-[175rem] my-8 mx-auto">
                <img className="inline" src='icons/icon32.png'></img>
                <h2 className="inline ml-4 text-3xl font-bold align-middle">Jimakun</h2>
            </div>
        </div>
    )
}

export default Header;