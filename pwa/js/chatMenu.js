import { chatRoot } from './chat.js'

let v, g
export const chatMenuView = v = new fg.View(null)
v.name = Object.keys({chatMenuView}).pop()
v.designSize = 1080*2183
v.bgColor = [0x12/0xff, 0x1b/0xff, 0x22/0xff, 1]
v.loadingColor = [1-v.bgColor[0],1-v.bgColor[1],1-v.bgColor[2],1]
v.loadingText = `Menu`//`${window.devicePixelRatio}, ${vvs = window.visualViewport.scale}`
v.easingState = 1
v.easingValue = 0
v.easingRate = 0.033
v.items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6', 'Item 7']
v.menuX = 482
v.menuY = 137
v.menuW = 588
v.menuH = 62 + 126 * v.items.length
v.menuR = 32
v.items.map((item, i) => {
  v.gadgets.push(g = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = item
  g.index = i
  g.clickFunc = function() {
    const g = this, v = this.viewport
    console.log(g.label)
  }
})
v.layoutFunc = function() {
  const v = this
  v.menuX = v.sw - v.menuW - 10
  for (const g of v.gadgets) {
    g.x = v.menuX + 45
    g.y = v.menuY + 79 + g.index * 126
    g.w = v.menuW - 45*2
    g.h = 33
    g.autoHull()
  }
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

  for (const g of v.gadgets) {
    mat4.identity(m)
    mat4.translate(m,m, [g.x, g.y + g.h, 0])
    mat4.scale(m,m, [g.h/14, g.h/14, 1])
    const c = v.loadingColor
    defaultFont.draw(0,0, g.label, [c[0],c[1],c[2],v.easingValue], v.mat, m)
  }
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