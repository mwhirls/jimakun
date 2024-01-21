import React from 'react';
import * as bunsetsu from "bunsetsu";
import { RuntimeMessage, RuntimeEvent, PlayAudioMessage } from '../../../common/events';
import { JMdictKana, JMdictWord } from '@scriptin/jmdict-simplified-types';
import SoundIcon from '../../../../public/assets/volume-05.svg';

export interface HeaderProps {
    word: bunsetsu.Word;
    entry: JMdictWord;
}

function getBestReading(word: bunsetsu.Word, entry: JMdictWord): JMdictKana | undefined {
    if (!entry.kana.length) {
        return undefined;
    }
    const baseForm = word.basicForm();
    let best: { kana: JMdictKana, kanji: string } | null = null;
    for (const kana of entry.kana) {
        for (const kanji of kana.appliesToKanji) {
            if (kanji === baseForm) { // exact match
                return kana;
            }
            else if (kanji === '*') { // * means "all"
                if (!best ||
                    !best.kana.common && kana.common) { // prioritize common readings
                    best = { kana, kanji };
                }
            }
        }
    }
    return best ? best.kana : entry.kana[0];
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

function Header({ word, entry }: HeaderProps) {
    const dictionaryForm = word.basicForm();
    const reading = getBestReading(word, entry);
    return (
        <div className='flex-none pt-6'>
            <div className="flex flex-initial flex-row flex-nowrap justify-between">
                <div>
                    <h3 className="inline-block mr-6 text-5xl text-black font-medium">{dictionaryForm}</h3>
                    <h5 className="inline-block text-4xl text-slate-500 font-medium">{reading?.text ?? ""}</h5>
                </div>
                <button onClick={() => onAudioClicked(word)}>
                    <SoundIcon></SoundIcon>
                </button>
            </div>
        </div>
    );
}
export default Header;