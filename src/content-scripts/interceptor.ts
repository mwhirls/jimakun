// must run in the MAIN world since we need to manipulate some global variables

const WEBVTT_FORMAT = 'webvtt-lssdh-ios8';
const NETFLIX_PROFILES = [
    'heaac-2-dash',
    'heaac-2hq-dash',
    'playready-h264mpl30-dash',
    'playready-h264mpl31-dash',
    'playready-h264hpl30-dash',
    'playready-h264hpl31-dash',
    'vp9-profile0-L30-dash-cenc',
    'vp9-profile0-L31-dash-cenc',
    'dfxp-ls-sdh',
    'simplesdh',
    'nflx-cmisc',
    'BIF240',
    'BIF320'
];

function isSubtitlesProperty(key: string, value: any): boolean {
    if (key === 'profiles' && Array.isArray(value)) {
        return value.some(item => NETFLIX_PROFILES.includes(item));
    }
    return false;
}

function findSubtitlesProperty(obj: object): Array<string> | null {
    for (let key in obj) {
        let value = obj[key as keyof typeof obj];
        if (Array.isArray(value)) {
            if (isSubtitlesProperty(key, value)) {
                return value;
            }
        }
        if (typeof value === 'object') {
            const prop = findSubtitlesProperty(value);
            if (prop) {
                return prop;
            }
        }
    }

    return null;
}

// Force a request for WebVTT to make Netflix return plain text subtitles
const originalStringify = JSON.stringify;
JSON.stringify = (value) => {
    let prop = findSubtitlesProperty(value);
    if (prop) {
        prop.unshift(WEBVTT_FORMAT);
    }
    return originalStringify(value);
}

const originalParse = JSON.parse;
JSON.parse = (text) => {
    const parsed = originalParse(text);
    if (parsed && parsed.result && parsed.result.timedtexttracks && parsed.result.movieId) {
        console.log(parsed);
    }
    return parsed;
}

export { }