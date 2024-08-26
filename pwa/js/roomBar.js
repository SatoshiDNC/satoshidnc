import { hpub } from './key.js'

let v, g
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
v.gadgets.push(g = v.menuGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = ':'
  g.clickFunc = function() {
    const g = this, v = this.viewport
    console.log(`${g.label} click`)
    if(g.target) fg.pushRoot(g.target)
    console.log(`changed root to: ${g.target?.name}`)
  }
v.layoutFunc = function() {
  const v = this
  g.x = v.sw - 64
  g.y = 51
  g.w = 12
  g.h = 45
  g.autoHull()
}
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
  mat4.scale(mat, mat, [35/14, 35/14, 1])
  x = 0, y = 0
  defaultFont.draw(x,y, 'Satoshi, D.N.C.', v.textColor, v.mat, mat)
  
  mat4.identity(mat)
  mat4.translate(mat, mat, [190, 116, 0])
  mat4.scale(mat, mat, [23/14, 23/14, 1])
  x = 0, y = 0
  defaultFont.draw(x,y, 'Online', v.textColor, v.mat, mat)

  let g = v.menuGad
  mat4.identity(mat)
  mat4.translate(mat, mat, [g.x, g.y+g.h, 0])
  mat4.scale(mat, mat, [g.h/11, g.h/11, 1])
  iconFont.draw(0,0, g.label, v.textColor, v.mat, mat)
}
