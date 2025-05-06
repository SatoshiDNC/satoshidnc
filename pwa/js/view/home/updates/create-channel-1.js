import { drawRect, drawPill, drawRoundedRect, alpha, blend } from '../../../draw.js'
import { noteDecode, nsecDecode, validKey, relayUrl, npub, nostrWatchRelays, getPubkey } from '../../../nostor-util.js'
import { findEvent, publishEvent } from '../../../nostor-app.js'
import { relays } from '../../../relays.js'
import { finalizeEvent } from 'nostr-tools'

const TITLE_TOP = 507
const ITEM_TOP = TITLE_TOP + 61
const ITEM_LEFT = 90
const ITEM_SIZE = 179
const BOT_SPACE = 203
const ITEM_INDENT = 253

const DEL_EVENT = 'DEL_EVENT'

let v, g
export const menuView = v = new fg.View(null)
v.name = Object.keys({menuView}).pop()
v.designSize = 1080*2183
v.bgColor = [0x12/0xff, 0x1b/0xff, 0x22/0xff, 1]
v.textColor = [0xf7/0xff, 0xf8/0xff, 0xfa/0xff, 1]
v.subtextColor = colors.inactive
v.flashAnim = 0
v.invoker = function(item, parentRoot) {
  const v = this
  const openPanel = () => {
    if (fg.getRoot() !== menuRoot || menuRoot.easingState() == -1) {
      menuRoot.easeIn?.()
    } else {
      menuRoot.easeOut?.()
    }
  }
  setTimeout(() => {
    openPanel()
  })
}
v.easingState = 1
v.easingValue = 0
v.easingRate = 0.033
v.items = [
  { key: DEL_EVENT, copyAnim: 0, name: 'Delete an event'},
]
v.menuX = 0
v.menuR = 32
v.gadgets.push(g = v.closeGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 69, g.h = 104
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    menuRoot.easeOut()
  }
v.gadgets.push(g = v.screenGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function() {
    menuRoot.easeOut()
  }
v.prepMenu = function(items) {
  const v = this
  v.items = items||v.items
  v.index = -1
  v.currentItemCount = v.items.length
}
v.layoutFunc = function() {
  const v = this
  v.menuH = 1669 - 56
  v.menuY = v.sh - v.menuH
  v.menuW = v.sw
  let g
  g = v.closeGad
  g.y = v.sh - 147
  g.w = v.sw - 2 * g.x
  g.autoHull()
  g = v.screenGad
  g.x = 0
  g.y = 0
  g.w = v.sw
  g.h = v.sh
  g.autoHull()
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
        menuRoot.out()
        if (menuRoot.followUp) {
          setTimeout(menuRoot.followUp)
          menuRoot.followUp = undefined
        }
      }
    }
    menuRoot.ghostOpacity = v.easingValue * 0.5
    v.setRenderFlag(true)
  }
  const f1 = v.easingValue
  const f0 = 1 - f1
  const m = mat4.create()
  const mat = mat4.create()

  drawRoundedRect(v, v.bgColor, 75, v.menuX, v.menuY + v.menuH * f0, v.menuW, v.menuH + 75)
  drawPill(v, colors.inactive, v.menuX + (v.menuW - 84) / 2, v.menuY + 26 + v.menuH * f0, 84, 11)

  let str = 'Create a channel to reach'
  let s = 51/14
  let y = TITLE_TOP + 51
  mat4.identity(m)
  mat4.translate(m,m, [v.menuX + (v.menuW - defaultFont.calcWidth(str) * s) / 2, v.menuY + y + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, str, v.textColor, v.mat, m)
  str = 'unlimited followers'
  y += 93
  mat4.identity(m)
  mat4.translate(m,m, [v.menuX + (v.menuW - defaultFont.calcWidth(str) * s) / 2, v.menuY + y + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, str, v.textColor, v.mat, m)

  str = '\x15'
  s = 211/18
  mat4.identity(m)
  mat4.translate(m,m, [v.menuX + (v.menuW - iconFont.calcWidth(str) * s) / 2, v.menuY + TITLE_TOP - 128 + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  iconFont.draw(0,0, str, colors.accent, v.mat, m)
  str = '\x16'
  s = 211/18
  mat4.identity(m)
  mat4.translate(m,m, [v.menuX + (v.menuW - iconFont.calcWidth(str) * s) / 2, v.menuY + TITLE_TOP - 128 + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  iconFont.draw(0,0, str, v.textColor, v.mat, m)

  str = 'Anyone can discover your channel'
  s = 33/14
  y += 123
  mat4.identity(m)
  mat4.translate(m,m, [v.menuX + ITEM_INDENT, v.menuY + y + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, str, v.textColor, v.mat, m)
  str = '\x17'
  s = 53/18
  mat4.identity(m)
  mat4.translate(m,m, [v.menuX + 116 - iconFont.calcWidth(str) * s / 2, v.menuY + y + 66 + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  iconFont.draw(0,0, str, v.textColor, v.mat, m)
  str = 'Channels are public, so anyone can find them'
  s = 29/14
  y += 61
  mat4.identity(m)
  mat4.translate(m,m, [v.menuX + ITEM_INDENT, v.menuY + y + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, str, v.subtextColor, v.mat, m)
  str = 'and see 30 days of history.'
  y += 56
  mat4.identity(m)
  mat4.translate(m,m, [v.menuX + ITEM_INDENT, v.menuY + y + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, str, v.subtextColor, v.mat, m)

  str = 'People see your channel, not you'
  s = 33/14
  y += 107
  mat4.identity(m)
  mat4.translate(m,m, [v.menuX + ITEM_INDENT, v.menuY + y + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, str, v.textColor, v.mat, m)
  str = '\x19'
  s = 53/18
  mat4.identity(m)
  mat4.translate(m,m, [v.menuX + 116 - iconFont.calcWidth(str) * s / 2, v.menuY + y + 66 + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  iconFont.draw(0,0, str, v.textColor, v.mat, m)
  str = 'Followers can’t see your phone number,'
  s = 29/14
  y += 61
  mat4.identity(m)
  mat4.translate(m,m, [v.menuX + ITEM_INDENT, v.menuY + y + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, str, v.subtextColor, v.mat, m)
  str = 'other profile pictures, or names.'
  y += 56
  mat4.identity(m)
  mat4.translate(m,m, [v.menuX + ITEM_INDENT, v.menuY + y + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, str, v.subtextColor, v.mat, m)

  str = 'You’re responsible for your channel'
  s = 33/14
  y += 107
  mat4.identity(m)
  mat4.translate(m,m, [v.menuX + ITEM_INDENT, v.menuY + y + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, str, v.textColor, v.mat, m)
  str = '\x1A'
  s = 53/18
  mat4.identity(m)
  mat4.translate(m,m, [v.menuX + 116 - iconFont.calcWidth(str) * s / 2, v.menuY + y + 66 + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  iconFont.draw(0,0, str, v.textColor, v.mat, m)
  str = 'Your channel needs to follow our guidelines'
  s = 29/14
  y += 61
  mat4.identity(m)
  mat4.translate(m,m, [v.menuX + ITEM_INDENT, v.menuY + y + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, str, v.subtextColor, v.mat, m)
  str = 'and is reviewed against them.'
  y += 56
  mat4.identity(m)
  mat4.translate(m,m, [v.menuX + ITEM_INDENT, v.menuY + y + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, str, v.subtextColor, v.mat, m)

  let g = v.closeGad
  drawPill(v, colors.accent, g.x, g.y + v.menuH * f0, g.w, g.h)
  mat4.identity(m)
  str = 'Continue'
  s = 29/14
  mat4.translate(m,m, [g.x + (g.w - defaultFont.calcWidth(str) * s) / 2, g.y + 66 + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, str, v.bgColor, v.mat, m)
}

export const menuRoot = v = new fg.OverlayView(null)
v.name = Object.keys({menuRoot}).pop()
v.a = menuView; menuView.parent = v
v.ghostOpacity = 0
v.easeIn = function(items) {
  const v = this
  menuView.prepMenu(items)
  menuView.easingState = 1
  menuView.easingRate = 0.06
  const r = fg.getRoot()
  if (r !== v) {
    v.b = r; r.parent = v
    v.ghostView = r
    fg.setRoot(v)
  }
}
v.easeOut = function() {
  const v = this
  menuView.easingState = -1
  menuView.easingRate = 0.1
  v.setRenderFlag(true)
}
v.easingState = function() {
  return menuView.easingState
}
v.out = function() {
  const v = this
  fg.setRoot(v.ghostView)
}
