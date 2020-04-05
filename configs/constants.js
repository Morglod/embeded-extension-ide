const path = require('path');
const { join: joinPath, resolve: resolvePath } = require('path');
const { rootPath } = require('./utils');

const SRC_PATH = rootPath('src');
const BUILD_OUTPUT_PATH = rootPath('dist');

const BACKGROUND_ENTRY_PATH = joinPath(SRC_PATH, 'background/index.ts');
const CONTENT_ENTRY_PATH = joinPath(SRC_PATH, 'contentscript/entry.ts');
const POPUP_ENTRY_PATH = joinPath(SRC_PATH, 'contentscript/popup/entry.ts');
const POPUP_TEMPLATE_PATH = joinPath(SRC_PATH, 'contentscript/popup/template.html');

module.exports = {
    SRC_PATH,
    BUILD_OUTPUT_PATH,

    BACKGROUND_ENTRY_PATH,
    CONTENT_ENTRY_PATH,

    POPUP_ENTRY_PATH,
    POPUP_TEMPLATE_PATH,
};