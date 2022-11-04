const fs = require('fs');
const path = require('path');

const indexFile = path.resolve(__dirname, '../lib/index.d.ts');
const buffer = fs.readFileSync(indexFile, 'utf8');
fs.writeFileSync(indexFile, buffer.replace(
    '/// <reference types="global" />',
    '/// <reference path="../global.d.ts" />'
));
