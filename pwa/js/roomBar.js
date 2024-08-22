import { hpub } from './key.js'

const roomBar = v = new fg.SliceView(null, 'tl', 50)
v.name = Object.keys({roomBar}).pop()
v.bgColor = [1,0,0,1]
v.fontColor = [1,1,1,1]
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const mat = mat4.create()
  mat4.identity(mat)
  const str = hpub()
  const x = (v.sw - nybbleFont.calcWidth(str))/2
  const y = (v.sh)/2
  nybbleFont.draw(x,y, str, v.fontColor, v.mat, mat)
}

