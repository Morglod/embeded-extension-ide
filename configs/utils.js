const glob = require('glob');
const path = require('path');

function rootPath(subpath) {
    return path.join(__dirname, '../', subpath);
}

module.exports = {
    rootPath,
};