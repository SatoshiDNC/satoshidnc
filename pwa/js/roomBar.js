const roomBar = v = new fg.SliceView(null, 'tl', 50)
v.name = Object.keys({roomBar}).pop()
v.bgColor = [1,0,0]
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
}

