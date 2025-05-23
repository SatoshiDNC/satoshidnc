import { drawPill, drawEllipse, alpha, blend } from '../../../../draw.js'
import { getName } from '../../../../personal.js'
import { updatePostedAsOf } from '../../../util.js'
import { kindInfo } from '../../../../nostor-util.js'
import { contentView } from './content.js'
import { barBot } from '../../bar-bot.js'
import { setUpdatesFlag } from '../../../../content.js'

let v, g
export const overlayView = v = new fg.View(null)
v.name = Object.keys({overlayView}).pop()
v.designSize = 1080*1825
v.titleColor = colors.white
v.subtitleColor = colors.softWhite
v.pause = false
v.gadgets.push(g = v.backGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 39, g.y = 63, g.w = 48, g.h = 48
  g.label = '\x08'
  g.textColor = colors.white
  g.font = iconFont
  g.fontSize = 13
  g.autoHull()
  g.clickFunc = function() {
    const g = this, v = this.viewport
    const rv = v.returnView || v.returnViewDefault
    rv.b?.b?.queryFunc?.()
    rv.c = barBot; barBot.parent = v.returnView
    rv.easingState = 1
    rv.easingValue = 0
    fg.setRoot(rv)
  }
v.gadgets.push(g = v.profileGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 126, g.y = 34, g.w = 105, g.h = 105
  g.autoHull()
  g.clickFunc = function() {
    const g = this, v = this.viewport
    g.target.setContext(v.updates[v.currentUpdate].hpub)
    g.target.backGad.target = v.returnView || v.returnViewDefault
    g.target.easingState = 1
    g.target.easingValue = 0
    fg.setRoot(g.target)
  }
v.setContext = function(updates, hpub, returnView) {
  const v = this
  v.returnView = returnView
  v.pendingUpdates = updates.filter(u => u.hpub != hpub)
  v.updates = updates.filter(u => u.hpub == hpub)
  v.lastTime = 0
  v.currentUpdate = 0
  for (const update of v.updates) {
    if (update.viewed) {
      v.currentUpdate++
    } else {
      break
    }
  }
  if (v.currentUpdate >= v.updates.length) {
    v.currentUpdate = 0
  }
}
v.layoutFunc = function() {
  const v = this
  let g
}
v.renderFunc = function() {
  const v = this
  const m = mat4.create()

  if (!v.updates[v.currentUpdate]) {
    setTimeout(() => {
      v.backGad.clickFunc()
    })
    return
  }

  const numUpdates = v.updates.length
  const now = Date.now()
  if (!v.lastTime) {
    v.elapsedTime = 0
    v.lastTime = now
  }
  const deltaTime = now - v.lastTime
  v.lastTime = now
  if (!contentView.screenGad.gestureState) {
    v.elapsedTime += deltaTime
  }
  const elapsedTime = v.elapsedTime
  const w = (v.sw-9-3-6*numUpdates)/numUpdates
  let pageTurn = false
  const fullBright = v.titleColor
  const halfBright = blend(contentView.bgColor, fullBright, TINGE.DIM_TEXT)
  for (let i = 0; i < numUpdates; i++) {
    if (i < v.currentUpdate) {
      drawPill(v, fullBright, 9+(w+6)*i,9, w,6)
    } else if (i > v.currentUpdate) {
      drawPill(v, halfBright, 9+(w+6)*i,9, w,6)
    } else {
      drawPill(v, halfBright, 9+(w+6)*i,9, w,6)
      drawPill(v, fullBright, 9+(w+6)*i,9, 6+(w-6)*(Math.max(0,Math.min(1,elapsedTime / 4000))),6)
      v.setRenderFlag(true)
      if (elapsedTime > 4000) {
        pageTurn = true
      }
    }
  }

  for (g of v.gadgets) if (g.label) {
    mat4.identity(m)
    mat4.translate(m, m, [g.x, g.y+g.h, 0])
    mat4.scale(m, m, [g.h/g.fontSize, g.h/g.fontSize, 1])
    g.font.draw(0,0, g.label, g.textColor, v.mat, m)
  }

  drawEllipse(v, v.titleColor, 126,34, 105,105)
  drawEllipse(v, colors.inactive, 129,37, 99,99)

  mat4.identity(m)
  mat4.translate(m, m, [263, 82, 0])
  mat4.scale(m, m, [33/14, 33/14, 1])
  defaultFont.draw(0,0, getName(v.updates[v.currentUpdate].hpub), v.titleColor, v.mat, m)

  const data = v.updates[v.currentUpdate].data

  mat4.identity(m)
  mat4.translate(m, m, [263, 131, 0])
  mat4.scale(m, m, [24/14, 24/14, 1])
  defaultFont.draw(0,0, updatePostedAsOf(data.created_at * 1000, true), alpha(v.titleColor, halfBright[3]), v.mat, m)

  let t,tw,th,ts

  t = `${data.kind} · ${(''+kindInfo.filter(r=>r.kindMax?r.kind<=data.kind&&data.kind<=r.kindMax:r.kind==data.kind)?.[0]?.desc).toUpperCase()}`
  // tw = defaultFont.calcWidth(t)
  // ts = 20/14
  // mat4.identity(m)
  // mat4.translate(m, m, [15, 200, 0])
  mat4.scale(m, m, [0.85, 0.85, 1])
  defaultFont.draw(20,0, t, halfBright, v.mat, m)

  if (pageTurn) {
    v.currentUpdate += 1
    v.lastTime = 0
    if (v.currentUpdate >= v.updates.length) {
      if (v.pendingUpdates.length > 0) {
        console.log(`switching to ${v.pendingUpdates[0]}`)
        v.parent.setContext(v.pendingUpdates, v.pendingUpdates[0].hpub, v.parent.parent)
        v.parent.relayout()
      } else {
        setTimeout(() => {
          v.backGad.clickFunc()
        })
      }
    }
  }

}
