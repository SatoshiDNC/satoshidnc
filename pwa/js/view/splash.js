import { setEasingParameters } from './util.js'

export const splash = v = new fg.View(null)
v.name = Object.keys({splash}).pop()
v.designSize = 640*400
v.bgColor = [0,0,0,1]
v.loadingColor = [1-v.bgColor[0],1-v.bgColor[1],1-v.bgColor[2],1]
v.loadingText = `initializing...`
v.setText = function(text) {
  if (text == this.loadingText) return
  this.loadingText = text
  console.log('init:', text)
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const mat = mat4.create()
  mat4.identity(mat)
  const str = v.loadingText
  const x = (v.sw - defaultFont.calcWidth(str))/2
  const y = (v.sh)/2
  defaultFont.draw(x,y, str, v.loadingColor, v.mat, mat)

  this.renderFinish?.()
}
setEasingParameters(v)
