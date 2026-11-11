const fs = require('node:fs')
const path = require('node:path')

const root = path.join(__dirname, '..')
const png = fs.readFileSync(path.join(root, 'assets', 'logo.png')).toString('base64')
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">'
  + '<image width="512" height="512" href="data:image/png;base64,' + png + '"/>'
  + '</svg>'
fs.writeFileSync(path.join(root, 'icon.svg'), svg)
console.log('icon.svg', Buffer.byteLength(svg))
