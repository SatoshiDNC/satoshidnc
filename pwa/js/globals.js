const fg = FireGlass, fgp = FireGlassForPrinter
const df = Rune, dfp = RuneForPrinter
let gl, glp // OpenGL contexts
let prog2
let mainShapes
const colors = {
  inactive: [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1],
  inactiveDark: [0x24/0xff, 0x2b/0xff, 0x31/0xff, 1],
  accent: [0x21/0xff, 0xc0/0xff, 0x63/0xff, 1],
  accentDark: [0x10/0xff, 0x36/0xff, 0x29/0xff, 1],
  accentButtonFace: [0x21/0xff, 0xc0/0xff, 0x63/0xff, 1],
  accentButtonText: [0x0b/0xff, 0x14/0xff, 0x19/0xff, 1],
  activeText: [0x21/0xff, 0xc0/0xff, 0x63/0xff, 1],
  chatTextBox: [0x1f/0xff, 0x2c/0xff, 0x34/0xff, 1],
  chatInfoBubble: [0x1c/0xff, 0x27/0xff, 0x2d/0xff, 1],
  chatInfoText: [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1],
}
