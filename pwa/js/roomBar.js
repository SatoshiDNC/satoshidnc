import { hpub } from './key.js'

export const roomBar = v = new fg.SliceView(null, 'tl', 50)
v.name = Object.keys({roomBar}).pop()
v.bgColor = [0.5,0.5,0.5,1]
v.fontColor = [1,1,1,1]
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
  hpub().toUpperCase().match(/.{1,16}/g).map((str, i) => {
    mat4.identity(mat)
    console.log(str, i)
    const x = (v.sw - nybbleFont.calcWidth(str))/2
    const y = (v.sh)/2
    nybbleFont.draw(x,y + i*8, str, v.shirtColor[i], v.mat, mat)
  })
}

