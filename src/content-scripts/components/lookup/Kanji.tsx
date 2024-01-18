import React, { useEffect, useState } from 'react';
import { LookupKanjiMessage, RuntimeEvent, RuntimeMessage } from '../../../util/events';
import { JMdictWord, Kanjidic2Character, Kanjidic2ReadingMeaning } from '@scriptin/jmdict-simplified-types';

// https://stackoverflow.com/questions/15033196/using-javascript-to-check-whether-a-string-contains-japanese-characters-includi
function isKanji(char: string) {
    if (char.length !== 1) {
        return false;
    }
    const code = char.codePointAt(0);
    return (code && code >= 0x4e00 && code <= 0x9faf) || // CJK (common & uncommon) 
        (code && code >= 0x3400 && code <= 0x4dbf);  // CJK Ext. A (rare)
}

function extractKanji(word: string): string[] {
    const chars = word.split('');
    return chars.filter(c => isKanji(c));
}

async function lookupKanji(entry: JMdictWord): Promise<Kanjidic2Character[]> {
    const kanjiWords = entry.kanji.map(k => k.text);
    const kanji = kanjiWords.flatMap(word => extractKanji(word));
    const unique = kanji.filter((c, index, arr) => arr.indexOf(c) === index);
    const data: LookupKanjiMessage = { kanji: unique };
    const message: RuntimeMessage = { event: RuntimeEvent.LookupKanji, data: data };
    return chrome.runtime.sendMessage(message);
}

interface InlineHeadingProps {
    header: string;
    content: string;
}

function InlineHeading({ header, content }: InlineHeadingProps): JSX.Element {
    return (
        <div className='text-3xl'>
            <div className='inline-block border border-slate-400 rounded-lg mr-4 p-2 font-medium'>
                <h5 className='leading-none w-full h-0 pb-[100%]'>{header}</h5>
            </div>
            <p className="inline">{content}</p>
        </div>
    )
}

interface ReadingMeaningProps {
    readingMeaning: Kanjidic2ReadingMeaning | null;
}

function ReadingMeaning({ readingMeaning }: ReadingMeaningProps): JSX.Element {
    if (!readingMeaning) {
        return <></>
    }
    const nanori = readingMeaning.nanori.join(', ');
    return (
        <div className='text-4xl font-light flex flex-col gap-4'>
            {
                readingMeaning.groups.map((group, groupIndex) => {
                    const meanings = group.meanings.filter(m => m.lang === "en").map(m => m.value).join(', ');
                    const onyomi = group.readings.filter(r => r.type === "ja_on").map(r => r.value).join(', ');
                    const kunyomi = group.readings.filter(r => r.type === "ja_kun").map(r => r.value).join(', ');
                    return (
                        <div key={groupIndex} className='flex flex-col gap-4'>
                            {meanings.length > 0 && <p>{meanings}</p>}
                            {onyomi.length > 0 && <InlineHeading header={"音"} content={onyomi}></InlineHeading>}
                            {kunyomi.length > 0 && <InlineHeading header={"訓"} content={kunyomi}></InlineHeading>}
                        </div>
                    )
                })
            }
            {nanori.length > 0 && <InlineHeading header={"名"} content={nanori}></InlineHeading>}
        </div>
    )
}

export interface KanjiProps {
    entry: JMdictWord;
}

function Kanji({ entry }: KanjiProps) {
    const [kanji, setKanji] = useState<Kanjidic2Character[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const kanji = await lookupKanji(entry);
                setKanji(kanji);
            } catch (e) {
                console.error(e);
            }
        })();

    }, []);

    return (
        <div className='flex flex-col gap-4 divide-y'>
            {
                kanji.map((kanji, index) => {
                    return (
                        <div key={index} className="py-4 flex flex-row gap-8">
                            <h3 className='text-7xl font-light pt-2'>{kanji.literal}</h3>
                            <div>
                                <ReadingMeaning readingMeaning={kanji.readingMeaning}></ReadingMeaning>
                            </div>
                        </div>
                    );
                })
            }
        </div>
    );
}
export default Kanji;
