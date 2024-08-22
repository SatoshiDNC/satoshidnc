import { hpub } from './key.js'

export const appBar = v = new fg.View()
v.name = Object.keys({appBar}).pop()
v.designHeight = 147
v.bgColor = [0.043,0.078,0.106,1]
v.textColor = [1,1,1,1]
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const mat = mat4.create()
  mat4.identity(mat)
  mat4.translate(mat, mat, [42, 53, 0])
  mat4.scale(mat, mat, [1/14*44, 1/14*44, 1])
  let x = 0, y = 0
  defaultFont.draw(x,y, 'Satoshi, D.N.C.', v.textColor, v.mat, mat)
}

