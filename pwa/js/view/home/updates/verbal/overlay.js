import { drawPill, drawEllipse, alpha } from '../../../../draw.js'
import { getPersonalData as getAttr } from '../../../../personal.js'
import { updatePostedAsOf } from '../../../util.js'
import { kindInfo } from '../../../../nostor.js'
import { contentView } from './content.js'

let v, g
export const overlayView = v = new fg.View(null)
v.name = Object.keys({overlayView}).pop()
v.designSize = 1080*1825
v.buttonColor = alpha(colors.black, 0.7)
v.titleColor = colors.white
v.subtitleColor = colors.softWhite
v.pause = false
v.gadgets.push(g = v.closeGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 34, g.y = 34, g.w = 110, g.h = 110
  g.label = '\x08'
  g.textColor = colors.white
  g.font = iconFont
  g.fontSize = 13
  g.autoHull()
  g.clickFunc = function() {
    const g = this, v = this.viewport
    //g.root.easeOut(g.target)
    v.returnView.b.b.clearQuery()
    v.returnView.easingState = 1
    v.returnView.easingValue = 0
    fg.setRoot(v.returnView)
  }
v.setContext = function() {
  const v = this
}
v.layoutFunc = function() {
  const v = this
  let g
}
v.renderFunc = function() {
  const v = this
  const m = mat4.create()

  for (g of v.gadgets) {
    drawEllipse(v, v.buttonColor, g.x,g.y, g.w,g.h)
  }

}
