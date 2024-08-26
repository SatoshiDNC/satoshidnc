import { chatRoot } from './chat.js'

export const chatMenuView = v = new fg.View(null)
v.name = Object.keys({chatMenuView}).pop()
v.bgColor = [0x12/0xff, 0x1b/0xff, 0x22/0xff, 1]
v.loadingColor = [1-v.bgColor[0],1-v.bgColor[1],1-v.bgColor[2],1]
v.loadingText = `Menu`//`${window.devicePixelRatio}, ${vvs = window.visualViewport.scale}`
v.easingState = 1
v.easingValue = 0
v.easingRate = 0.01
v.setText = function(text) {
  this.loadingText = text
  console.log('splash:', text)
}
v.finish = function(text) {
  if (text) this.loadingText = text
}
v.renderFunc = function() {
  const v = this
  console.log(`easing: ${v.easingState} ${v.easingValue} ${chatMenuRoot.ghostOpacity}`)
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
  const mat = mat4.create()
  mat4.identity(mat)
  const str = v.loadingText
  const x = (v.sw - defaultFont.calcWidth(str))/2
  const y = (v.sh)/2
  const c = v.loadingColor
  defaultFont.draw(x,y, str, [c[0],c[1],c[2],v.easingValue], v.mat, mat)
}

export const chatMenu = v = new fg.OverlayView(null)
v.name = Object.keys({chatMenu}).pop()
v.a = chatMenuView; chatMenuView.parent = v
v.b = chatRoot; chatRoot.parent = v

export const chatMenuRoot = chatMenu
chatMenuRoot.easeIn = function() {
  console.log(`easeIn`)
  const v = this
  chatMenuView.easingState = 1
  chatMenuRoot.ghostOpacity = 0
  chatMenuRoot.in()
}
chatMenuRoot.easeOut = function() {
  console.log(`easeOut`)
  const v = this
  chatMenuView.easingState = -1
}
chatMenuRoot.easingState = function() {
  return chatMenuView.easingState
}
chatMenuRoot.in = function() {
  const r = fg.getRoot()
  console.log(`root: ${r.name} ${chatMenuRoot.ghostOpacity}`)
  if (r !== this) {
    chatMenuRoot.ghostView = r
    fg.setRoot(this)
    console.log(`changed root to: ${fg.getRoot().name}`)
  }
}
chatMenuRoot.out = function() {
  fg.setRoot(chatMenuRoot.ghostView)
  console.log(`changed root to: ${fg.getRoot().name}`)
}