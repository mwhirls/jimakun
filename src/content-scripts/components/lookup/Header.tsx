import React from 'react';
import * as bunsetsu from "bunsetsu";
import { RuntimeMessage, RuntimeEvent, PlayAudioMessage } from '../../../util/events';

const SOUND_ICON = 'assets/icon-sound-on.svg';

export interface HeaderProps {
    word: bunsetsu.Word;
}

function onAudioClicked(word: bunsetsu.Word) {
    const utterance = word.basicForm();
    if (!utterance) {
        return;
    }
    const data: PlayAudioMessage = { utterance };
    const message: RuntimeMessage = { event: RuntimeEvent.PlayAudio, data };
    chrome.runtime.sendMessage(message);
}

function Header({ word }: HeaderProps) {
    const dictionaryForm = word.basicForm();
    const reading = word.reading();
    const audioImageUrl = chrome.runtime.getURL(SOUND_ICON);
    return (
        <div className='flex-none pt-6'>
            <div className="flex flex-initial flex-row flex-nowrap justify-between">
                <div>
                    <h3 className="inline-block mr-6 text-5xl text-black font-medium">{dictionaryForm}</h3>
                    <h5 className="inline-block text-4xl text-slate-500 font-medium">{reading}</h5>
                </div>
                <button onClick={() => onAudioClicked(word)}><img src={audioImageUrl}></img></button>
            </div>
        </div>
    );
}
export default Header;