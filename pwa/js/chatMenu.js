import { chatRoom } from './chat.js'

export const chatMenuView = v = new fg.View(null)
v.name = Object.keys({chatMenuView}).pop()
v.bgColor = [0x12/0xff, 0x1b/0xff, 0x22/0xff, 1]
v.loadingColor = [1-v.bgColor[0],1-v.bgColor[1],1-v.bgColor[2],1]
v.loadingText = `Menu`//`${window.devicePixelRatio}, ${vvs = window.visualViewport.scale}`
v.setText = function(text) {
  this.loadingText = text
  console.log('splash:', text)
}
v.finish = function(text) {
  if (text) this.loadingText = text
}
v.renderFunc = function() {
  const v = this
  const mat = mat4.create()
  mat4.identity(mat)
  const str = v.loadingText
  const x = (v.sw - defaultFont.calcWidth(str))/2
  const y = (v.sh)/2
  defaultFont.draw(x,y, str, v.loadingColor, v.mat, mat)
}

export const chatMenu = v = new fg.OverlayView(null)
v.name = Object.keys({chatMenu}).pop()
v.a = chatMenuView; chatMenuView.parent = v
v.b = chatRoot; chatRoot.parent = v

export const chatMenuRoot = chatMenu
