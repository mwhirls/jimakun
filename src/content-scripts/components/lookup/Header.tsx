import React, { useContext } from 'react';
import * as bunsetsu from "bunsetsu";
import { RuntimeMessage, RuntimeEvent, PlayAudioMessage } from '../../../common/events';
import { JMdictKana, JMdictWord } from '@scriptin/jmdict-simplified-types';
import { ChromeExtensionContext, ExtensionContext } from '../../contexts/ExtensionContext';
import { sendMessage } from '../../util/browser-runtime';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';

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

function onAudioClicked(word: bunsetsu.Word, context: ExtensionContext) {
    const utterance = word.basicForm();
    if (!utterance) {
        return;
    }
    const data: PlayAudioMessage = { utterance };
    const message: RuntimeMessage = { event: RuntimeEvent.PlayAudio, data };
    sendMessage(message, context);
}

export interface HeaderProps {
    word: bunsetsu.Word;
    entry: JMdictWord;
    onCloseClicked: () => void;
}

function Header({ word, entry, onCloseClicked }: HeaderProps) {
    const dictionaryForm = word.basicForm();
    const reading = getBestReading(word, entry);
    const context = useContext(ChromeExtensionContext);
    return (
        <div className='flex-none pt-6'>
            <div className="flex flex-initial flex-row flex-nowrap justify-between">
                <div className="flex flex-row flex-no-wrap items-center gap-4">
                    <h3 className="text-5xl text-black font-semibold">{dictionaryForm}</h3>
                    <h5 className="text-4xl text-slate-500 font-medium">{reading?.text ?? ""}</h5>
                    <button className='w-12 text-slate-400 hover:text-black' onClick={() => onAudioClicked(word, context)}>
                        <SpeakerWaveIcon></SpeakerWaveIcon>
                    </button>
                </div>
                <button className='w-12 text-slate-400 hover:text-black' onClick={() => onCloseClicked()}>
                    <XMarkIcon></XMarkIcon>
                </button>
            </div>
        </div>
    );
}
export default Header;