import { chatRoot } from './chat.js'

export const chatMenuView = v = new fg.View(null)
v.name = Object.keys({chatMenuView}).pop()
v.designSize = 1080*2183
v.bgColor = [0x12/0xff, 0x1b/0xff, 0x22/0xff, 1]
v.loadingColor = [1-v.bgColor[0],1-v.bgColor[1],1-v.bgColor[2],1]
v.loadingText = `Menu`//`${window.devicePixelRatio}, ${vvs = window.visualViewport.scale}`
v.easingState = 1
v.easingValue = 0
v.easingRate = 0.033
v.menuX = 482
v.menuY = 137
v.menuW = 588
v.menuH = 138 + 126 * 7
v.menuR = 32
v.setText = function(text) {
  this.loadingText = text
  console.log('splash:', text)
}
v.finish = function(text) {
  if (text) this.loadingText = text
}
v.layoutFunc = function() {
  const v = this
  v.menuX = v.sw - v.menuW - 10
}
v.renderFunc = function() {
  const v = this
  if (v.easingState) {
    if (v.easingState == 1) {
      v.easingValue += v.easingRate
      if (v.easingValue >= 1) {
        v.easingValue = 1
        v.easingState = 0
      }
    }
    if (v.easingState == -1) {
      v.easingValue -= v.easingRate
      if (v.easingValue < 0) {
        v.easingValue = 0
        v.easingState = 0
        chatMenuRoot.out()
      }
    }
    chatMenuRoot.ghostOpacity = v.easingValue * 0.5
    v.setRenderFlag(true)
  }
  const m = mat4.create()

  mainShapes.useProg2()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(v.bgColor))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [v.menuX, v.menuY, 0])
  mat4.scale(m,m, [v.menuW, v.menuH * v.easingValue, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')

  mat4.identity(m)
  mat4.translate(m,m, [v.menuX, v.menuY, 0])
  mat4.translate(m,m, [45, 112, 0])
  mat4.scale(m,m, [33/14, 33/14, 1])
  const str = v.loadingText
  const c = v.loadingColor
  defaultFont.draw(0,0, str, [c[0],c[1],c[2],v.easingValue], v.mat, m)
}

export const chatMenu = v = new fg.OverlayView(null)
v.name = Object.keys({chatMenu}).pop()
v.a = chatMenuView; chatMenuView.parent = v
v.b = chatRoot; chatRoot.parent = v

export const chatMenuRoot = chatMenu
chatMenuRoot.ghostOpacity = 0
chatMenuRoot.easeIn = function() {
  const v = this
  chatMenuView.easingState = 1
  chatMenuView.easingRate = 0.06
  const r = fg.getRoot()
  if (r !== this) {
    chatMenuRoot.ghostView = r
    fg.setRoot(this)
  }
}
chatMenuRoot.easeOut = function() {
  const v = this
  chatMenuView.easingState = -1
  chatMenuView.easingRate = 0.1
}
chatMenuRoot.easingState = function() {
  return chatMenuView.easingState
}
chatMenuRoot.out = function() {
  fg.setRoot(chatMenuRoot.ghostView)
}