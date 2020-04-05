import * as chromecast from './chrome/chrome-cast';
import * as chrome from './chrome/chrome';
import * as chromeharformat from './chrome/har-format';

import * as filesystem from './filesystem';

import * as filewriter from './filewriter';
import * as harFormat from './har-format';

export default {
    [chromecast.path]: chromecast.text,
    [chrome.path]: chrome.text,
    [chromeharformat.path]: chromeharformat.text,
    [filesystem.path]: filesystem.text,
    [filewriter.path]: filewriter.text,
    [harFormat.path]: harFormat.text,
};