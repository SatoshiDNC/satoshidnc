const sendBar = v = new fg.SliceView(null, 'tl', 50)
v.name = Object.keys({sendBar}).pop()
v.bgColor = [0,0,1]
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
}
