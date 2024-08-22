const fg = FireGlass, fgp = FireGlassForPrinter
const df = Rune, dfp = RuneForPrinter
let gl, glp // OpenGL contexts

function hsec() { return window.localStorage.getItem('hsec')||(window.localStorage.setItem('hsec', Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex'))||window.localStorage.getItem('hsec')) }
function hpub() { return getPublicKey(Buffer.from(hsec(), 'hex')) }
function npub() { return nip19.npubEncode(hpub()) }
function nsec() { return nip19.nsecEncode(Buffer.from(hsec(), 'hex')) }
