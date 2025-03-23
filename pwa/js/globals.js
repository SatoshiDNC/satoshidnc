const fg = FireGlass, fgp = FireGlassForPrinter
const df = Rune, dfp = RuneForPrinter
let gl, glp // OpenGL contexts
let prog2
let mainShapes

const fixedColors = {
  black: [0x00/0xff, 0x00/0xff, 0x00/0xff, 1],
  softWhite: [0xe6/0xff, 0xe6/0xff, 0xe6/0xff, 1],
  white: [0xff/0xff, 0xff/0xff, 0xff/0xff, 1],
}
const themeColors = {
  background: [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1],
  title: [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1],
  inactive: [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1],
  inactiveDark: [0x24/0xff, 0x2b/0xff, 0x31/0xff, 1],
  bubbleDark: [0x1a/0xff, 0x1a/0xff, 0x1a/0xff, 1],
  accent: [0x21/0xff, 0xc0/0xff, 0x63/0xff, 1],
  accentDark: [0x10/0xff, 0x36/0xff, 0x29/0xff, 1],
  subtle: [0x1f/0xff, 0x2c/0xff, 0x34/0xff, 1],
  activeText: [0x21/0xff, 0xc0/0xff, 0x63/0xff, 1],
  chatInfoBubble: [0x1c/0xff, 0x27/0xff, 0x2d/0xff, 1],
  chatInfoText: [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1],
  foreground: [0xf7/0xff, 0xf8/0xff, 0xfa/0xff, 1],
  chatInfoText2: [0xfe/0xff, 0xd2/0xff, 0x7b/0xff, 1],
}
const objectColors = {

  // floating action buttons (add contact, add update)
  accentButtonFace: themeColors.accent,
  accentButtonText: themeColors.background,

  // floating action buttons (add update)
  subtleButtonFace: themeColors.subtle,
  subtleButtonText: themeColors.foreground,

  // chat text box
  chatTextBox: themeColors.subtle,
}
const colors = { ...fixedColors, ...themeColors, ...objectColors }

const icap = function(s) {
  const i = s.substring(0,1)
  if (i) {
    return i.toUpperCase() + s.substring(1)
  } else {
    return s
  }
}

const hash = function(input) {
  return new Promise((resolve, reject) => {
    const inputBuf = new TextEncoder().encode(input)
    window.crypto.subtle.digest('SHA-256', inputBuf).then(outBuf => {
      resolve(Array.from(new Uint8Array(outBuf)).map((i) => i.toString(16).padStart(2, '0')).join(''))
    }, error => {
      reject(`error while hashing: ${error}`)
    })
  })
}
