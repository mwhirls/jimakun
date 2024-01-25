export function toHiragana(text: string | undefined): string {
    if (!text) {
        return "";
    }
    const result = [];
    for (let i = 0; i < text.length; i++) {
        const code = text.codePointAt(i);
        if (code && code >= 0x30A1 && code <= 0x30F6) { // katakana 
            result.push(String.fromCodePoint(code - 0x60));
        } else if (code && code >= 0x3041 && code <= 0x3096) { // hiragana
            result.push(text.charAt(i));
        }
    }
    return result.join('');
}

// https://stackoverflow.com/questions/15033196/using-javascript-to-check-whether-a-string-contains-japanese-characters-includi
export function isKanji(char: string) {
    if (char.length !== 1) {
        return false;
    }
    const code = char.codePointAt(0);
    return (code && code >= 0x4e00 && code <= 0x9faf) || // CJK (common & uncommon) 
        (code && code >= 0x3400 && code <= 0x4dbf);  // CJK Ext. A (rare)
}

export function extractKanji(word: string): string[] {
    const chars = word.split('');
    return chars.filter(c => isKanji(c));
}