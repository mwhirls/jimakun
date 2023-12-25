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
        <div>
            <h3>{dictionaryForm}</h3>
            <h5>{reading}</h5>
            <button><img src={audioImageUrl}></img></button>
        </div>
    );
}
export default Header;