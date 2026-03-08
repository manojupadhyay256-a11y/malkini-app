const https = require('https');
const fs = require('fs');

const url192 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/192px-React-icon.svg.png';
const url512 = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png';

https.get(url192, (res) => res.pipe(fs.createWriteStream('public/icon-192x192.png')));
https.get(url512, (res) => res.pipe(fs.createWriteStream('public/icon-512x512.png')));
console.log('Icons downloaded.');
