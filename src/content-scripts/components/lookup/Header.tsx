import React, { useContext } from 'react';
import * as bunsetsu from "bunsetsu";
import { RuntimeMessage, RuntimeEvent, PlayAudioMessage } from '../../../common/events';
import { JMdictKana, JMdictKanji, JMdictWord } from '@scriptin/jmdict-simplified-types';
import { ChromeExtensionContext, ExtensionContext } from '../../contexts/ExtensionContext';
import { sendMessage } from '../../util/browser-runtime';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';

function getDictionaryForm(word: bunsetsu.Word, entry: JMdictWord): string {
    const best: { kana?: JMdictKana, kanji?: JMdictKanji } = {};
    for (const kanji of entry.kanji) {
        if (kanji.text === word.baseForm ||
            kanji.text === word.surfaceForm) {
            return kanji.text;
        }
        if (!best.kanji?.common && kanji.common) {
            best.kanji = kanji;
        }
    }
    for (const kana of entry.kana) {
        if (kana.text === word.baseForm ||
            kana.text === word.surfaceForm) {
            return kana.text;
        }
        if (!best.kana?.common && kana.common) {
            best.kana = kana;
        }
    }
    const dictionaryForm = best.kanji ? best.kanji.text : best.kana?.text;
    const fallback = word.baseForm ?? word.surfaceForm;
    return dictionaryForm ?? fallback;
}

function getBestReading(dictionaryForm: string, entry: JMdictWord): JMdictKana | undefined {
    if (!entry.kana.length) {
        return undefined;
    }
    let best: JMdictKana | null = null;
    for (const kana of entry.kana) {
        for (const kanji of kana.appliesToKanji) {
            if (kanji === dictionaryForm) { // exact match
                return kana;
            }
            else if (kanji === '*') { // * means "all"
                if (!best?.common && kana.common) { // prioritize common readings
                    best = kana;
                }
            }
        }
    }
    return best ? best : entry.kana[0];
}

function onAudioClicked(word: bunsetsu.Word, context: ExtensionContext) {
    const utterance = word.baseForm;
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
    const dictionaryForm = getDictionaryForm(word, entry);
    const reading = getBestReading(dictionaryForm, entry);
    const context = useContext(ChromeExtensionContext);
    return (
        <div className='flex-none pt-6'>
            <div className="flex flex-initial flex-row flex-nowrap justify-between">
                <div className="flex flex-row flex-no-wrap items-center gap-4">
                    <h3 className="text-5xl text-black font-semibold">{dictionaryForm}</h3>
                    <h5 className="text-4xl text-black font-medium">{reading?.text ?? ""}</h5>
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