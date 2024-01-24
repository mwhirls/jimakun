import React, { useContext, useEffect, useState } from 'react';
import { LookupKanjiMessage, RuntimeEvent, RuntimeMessage } from '../../../common/events';
import { JMdictWord, Kanjidic2Character, Kanjidic2ReadingMeaning } from '@scriptin/jmdict-simplified-types';
import { ChromeExtensionContext, ExtensionContext } from '../../contexts/ExtensionContext';
import { sendMessage } from '../../util/browser-runtime';

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

async function lookupKanji(entry: JMdictWord, context: ExtensionContext): Promise<Kanjidic2Character[]> {
    const kanjiWords = entry.kanji.map(k => k.text);
    const kanji = kanjiWords.flatMap(word => extractKanji(word));
    const unique = kanji.filter((c, index, arr) => arr.indexOf(c) === index);
    const data: LookupKanjiMessage = { kanji: unique };
    const message: RuntimeMessage = { event: RuntimeEvent.LookupKanji, data: data };
    return sendMessage(message, context);
}

interface SquareIconProps {
    content: string;
    className: string;
}

function SquareIcon({ content, className }: SquareIconProps): JSX.Element {
    return (
        <div className={`border rounded-lg mr-4 p-2 font-medium bg-white ${className}`}>
            <h5 className='leading-none w-full h-0 pb-[100%]'>{content}</h5>
        </div>
    )
}

interface SingleLineProps {
    header: JSX.Element;
    content: string;
}

function SingleLine({ header, content }: SingleLineProps): JSX.Element {
    return (
        <div className='text-3xl'>
            <span className="inline-block">
                {header}
            </span>
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
    const nanoriIcon = <SquareIcon content='名' className='text-blue-700 border-blue-700'></SquareIcon>;
    return (
        <div className='text-4xl font-normal flex flex-col gap-4'>
            {
                readingMeaning.groups.map((group, groupIndex) => {
                    const meanings = group.meanings.filter(m => m.lang === "en").map(m => m.value).join(', ');
                    const onyomi = group.readings.filter(r => r.type === "ja_on").map(r => r.value).join(', ');
                    const onyomiIcon = <SquareIcon content='音' className="text-red-700 border-red-700"></SquareIcon>;
                    const kunyomi = group.readings.filter(r => r.type === "ja_kun").map(r => r.value).join(', ');
                    const kunyomiIcon = <SquareIcon content='訓' className='text-green-700 border-green-700'></SquareIcon>;
                    return (
                        <div key={groupIndex} className='flex flex-col gap-4'>
                            {meanings.length > 0 && <p>{meanings}</p>}
                            {onyomi.length > 0 && <SingleLine header={onyomiIcon} content={onyomi}></SingleLine>}
                            {kunyomi.length > 0 && <SingleLine header={kunyomiIcon} content={kunyomi}></SingleLine>}
                        </div>
                    )
                })
            }
            {nanori.length > 0 && <SingleLine header={nanoriIcon} content={nanori}></SingleLine>}
        </div>
    )
}

export interface KanjiProps {
    entry: JMdictWord;
}

function Kanji({ entry }: KanjiProps) {
    const [kanji, setKanji] = useState<Kanjidic2Character[]>([]);
    const context = useContext(ChromeExtensionContext);

    useEffect(() => {
        (async () => {
            try {
                const kanji = await lookupKanji(entry, context);
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
