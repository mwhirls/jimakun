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