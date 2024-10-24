import { overlayView } from './overlay.js'
import { markUpdateAsViewed } from '../../../../content.js'

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.randomColor = function() {
  const v = this
  v.bgColor = [
    Math.floor(Math.random()*16)/32,
    Math.floor(Math.random()*16)/32,
    Math.floor(Math.random()*16)/32, 1]
  contentView.setRenderFlag(true)
}
v.randomColor()
v.textColor = [1,1,1,1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.subtitleColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
v.buttonFaceColor = colors.accentButtonFace
v.buttonTextColor = colors.accentButtonText
v.gadgets.push(g = v.screenGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
v.setContext = function() {
  const v = this
}
v.layoutFunc = function() {
  const v = this
  let g
  g = v.screenGad
  g.x = 0, g.y = 0
  g.w = v.sw, g.h = v.sh
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)

}
