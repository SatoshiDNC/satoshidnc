import { hpub } from './key.js'

export const roomBar = v = new fg.View()
v.name = Object.keys({roomBar}).pop()
v.designHeight = 147
v.bgColor = [0.043,0.078,0.106,1]
v.textColor = [1,1,1,1]
v.white = [1,1,1,1]
v.yellow = [1,0.8,0,1]
v.red = [1,0,0,1]
v.blue = [0,0,1,1]
v.shirtColor = [v.white, v.yellow, v.red, v.blue]
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const mat = mat4.create()
  mat4.identity(mat)
  mat4.translate(mat, mat, [75, 27, 0])
  mat4.scale(mat, mat, [1/32*92, 1/32*92, 1])
  const m = mat4.create()
  let x = -0.5, y = 8.5
  hpub().toUpperCase().match(/.{1,16}/g).map((str, i) => {
    mat4.copy(m, mat)
    nybbleFont.draw(x,y + i*8, str, v.textColor, v.mat, m)
  })
  mat4.identity(mat)
  mat4.translate(mat, mat, [190, 68, 0])
  mat4.scale(mat, mat, [1/14*35, 1/14*35, 1])
  x = 0, y = 0
  defaultFont.draw(x,y, 'Satoshi, D.N.C.', v.textColor, v.mat, mat)
  
  mat4.identity(mat)
  mat4.translate(mat, mat, [190, 116, 0])
  mat4.scale(mat, mat, [1/14*23, 1/14*23, 1])
  x = 0, y = 0
  defaultFont.draw(x,y, 'Online', v.textColor, v.mat, mat)
}

