import { drawPill, drawRect, drawEllipse, alpha } from '../../../../draw.js'
import { getPersonalData as getAttr } from '../../../../personal.js'
import { updatePostedAsOf } from '../../../util.js'
import { kindInfo } from '../../../../nostor.js'
import { contentView } from './content.js'

let v, g
export const overlayView = v = new fg.View(null)
v.name = Object.keys({overlayView}).pop()
v.designSize = 1080*1825
v.buttonFaceColor = alpha(colors.black, 0.5)
v.buttonTextColor = colors.white
v.titleColor = colors.white
v.subtitleColor = colors.softWhite
v.pause = false
v.gadgets.push(g = v.closeGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 34, g.y = 34, g.w = 110, g.h = 110
  g.icon = '\x12'
  g.autoHull()
  g.clickFunc = function() {
    const g = this, v = this.viewport
    //g.root.easeOut(g.target)
    v.returnView.b.b.clearQuery()
    v.returnView.easingState = 1
    v.returnView.easingValue = 0
    fg.setRoot(v.returnView)
  }
v.gadgets.push(g = v.emojiGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 34, g.y = 34, g.w = 110, g.h = 110
  g.icon = '\x10'
  g.clickFunc = function() {
    const g = this, v = this.viewport
  }
v.gadgets.push(g = v.fontGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 34, g.y = 34, g.w = 110, g.h = 110
  g.icon = 'T'
  g.font = defaultFont
  g.clickFunc = function() {
    const g = this, v = this.viewport
  }
v.gadgets.push(g = v.paletteGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 34, g.y = 34, g.w = 110, g.h = 110
  g.icon = '\x11'
  g.clickFunc = function() {
    const g = this, v = this.viewport
    contentView.randomColor()
  }
v.gadgets.push(g = v.audienceGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 34, g.y = 34, g.w = 110, g.h = 110
  g.label = 'Status (Public)'
  g.textSize = 29
  g.clickFunc = function() {
    const g = this, v = this.viewport
  }
v.gadgets.push(g = v.micSendGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 20, g.y = 20, g.w = 128, g.h = 128
  g.iconMic = '\x11'
  g.iconSend = '\x3e'
  g.icon = g.iconMic
  g.buttonFaceColor = colors.accent
  g.buttonTextColor = colors.background
  g.clickFunc = function() {
    const g = this, v = this.viewport
  }
v.setContext = function() {
  const v = this
}
v.layoutFunc = function() {
  const v = this
  let g
  g = v.paletteGad
  g.x = v.sw - 34 - g.w
  g.autoHull()
  g = v.fontGad
  g.x = v.paletteGad.x - 16 - g.w
  g.autoHull()
  g = v.emojiGad
  g.x = v.fontGad.x - 16 - g.w
  g.autoHull()
  g = v.audienceGad
  g.x = 21, g.y = v.sh - 126, g.w = 62 + defaultFont.calcWidth(g.label)*g.textSize/14, g.h = 84
  g.autoHull()
  g = v.micSendGad
  g.x = v.sw - 20 - g.w, g.y = v.sh - 20 - g.h
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  const m = mat4.create()

  drawRect(v, alpha(colors.black, 0.70), 0,v.sh-168, v.sw,168)

  for (g of v.gadgets) {
    if (g.label) {
      drawPill(v, colors.inactiveDark, g.x,g.y, g.w,g.h)
      const font = g.font || defaultFont
      const s = g.textSize/14
      mat4.identity(m)
      mat4.translate(m, m, [g.x+g.w/2-font.calcWidth(g.label)*s/2, g.y+g.h/2+g.textSize/2, 0])
      mat4.scale(m, m, [s, s, 1])
      font.draw(0,0, g.label, v.buttonTextColor, v.mat, m)
    } else if (g.icon) {
      drawEllipse(v, g.buttonFaceColor || v.buttonFaceColor, g.x,g.y, g.w,g.h)
      const font = g.font || iconFont
      const c = g.icon.codePointAt(0)
      const s = 53/font.glyphHeights[c]
      mat4.identity(m)
      mat4.translate(m, m, [g.x+g.w/2-(53/font.glyphHeights[c]*font.calcWidth(g.icon))/2, g.y+g.h/2+53/2, 0])
      mat4.scale(m, m, [s, s, 1])
      font.draw(0,0, g.icon, g.buttonTextColor || v.buttonTextColor, v.mat, m)
    }
  }

}
