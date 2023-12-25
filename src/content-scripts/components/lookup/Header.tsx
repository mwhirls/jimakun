import React from 'react';
import * as bunsetsu from "bunsetsu";

const SOUND_ICON = 'assets/icon-sound-on.svg';

export interface HeaderProps {
    word: bunsetsu.Word;
}

function Header({ word }: HeaderProps) {
    const dictionaryForm = word.basicForm();
    const reading = word.reading();
    const audioImageUrl = chrome.runtime.getURL(SOUND_ICON);
    return (
        <div className="flex flex-initial flex-row flex-nowrap justify-between mt-6">
            <div>
                <h3 className="inline-block mr-6 text-5xl text-black font-medium">{dictionaryForm}</h3>
                <h5 className="inline-block text-4xl text-slate-500 font-medium">{reading}</h5>
            </div>
            <button><img src={audioImageUrl}></img></button>
        </div>
    );
}
export default Header;