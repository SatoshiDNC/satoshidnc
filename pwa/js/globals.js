const fg = FireGlass, fgp = FireGlassForPrinter
const df = Rune, dfp = RuneForPrinter
let gl, glp // OpenGL contexts
let prog2
let mainShapes
const colors = {
  accentButtonFace: [0x21/0xff, 0xc0/0xff, 0x63/0xff, 1],
  accentButtonText: [0x0b/0xff, 0x14/0xff, 0x19/0xff, 1],
}
