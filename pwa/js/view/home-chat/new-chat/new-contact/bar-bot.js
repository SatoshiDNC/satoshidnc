let v, g
export const barBot = v = new fg.View()
v.name = Object.keys({barBot}).pop()
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.buttonFaceColor = colors.accentButtonFace
v.buttonTextColor = colors.accentButtonText
v.gadgets.push(g = v.saveGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 79, g.h = 104
  g.label = 'Save'
  g.clickFunc = function() {
    const g = this, v = g.viewport
    g.formView.clear()
    console.log('save')
  }
v.layoutFunc = function() {
  const v = this
  let g
  g = v.saveGad
  g.y = v.sh - 53 - 104
  g.w = v.sw - 79 - 79
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const m = mat4.create()

  mainShapes.useProg2()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(v.buttonFaceColor))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [g.x, g.y, 0])
  mat4.scale(m,m, [g.w, g.h, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')

  mat4.identity(m)
  const s = 28/14
  mat4.translate(m,m, [g.x + defaultFont.calcWidth(g.label) * s, g.y + 66, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, g.label, v.buttonTextColor, v.mat, m)
}
