const barBot = v = new fg.View()
v.name = Object.keys({barBot}).pop()
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
}
