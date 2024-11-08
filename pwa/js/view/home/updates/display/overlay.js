import { drawPill, drawEllipse, alpha } from '../../../../draw.js'
import { getPersonalData as getAttr } from '../../../../personal.js'
import { updatePostedAsOf } from '../../../util.js'
import { kindInfo } from '../../../../nostor-util.js'
import { contentView } from './content.js'

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
    //g.root.easeOut(g.target)
    v.returnView.b.b.queryFunc()
    v.returnView.easingState = 1
    v.returnView.easingValue = 0
    fg.setRoot(v.returnView)
  }
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
    //g.root.easeOut(g.target)
    v.returnView.b.b.queryFunc()
    v.returnView.easingState = 1
    v.returnView.easingValue = 0
    fg.setRoot(v.returnView)
  }
v.setContext = function(updates, hpub) {
  const v = this
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
  for (let i = 0; i < numUpdates; i++) {
    if (i < v.currentUpdate) {
      drawPill(v, [1,1,1,1], 9+(w+6)*i,9, w,6)
    } else if (i > v.currentUpdate) {
      drawPill(v, colors.inactive, 9+(w+6)*i,9, w,6)
    } else {
      drawPill(v, colors.inactive, 9+(w+6)*i,9, w,6)
      drawPill(v, [1,1,1,1], 9+(w+6)*i,9, 6+(w-6)*(Math.max(0,Math.min(1,elapsedTime / 4000))),6)
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
  defaultFont.draw(0,0, getAttr(v.updates[v.currentUpdate].hpub, 'name') || 'Unnamed', v.titleColor, v.mat, m)

  const data = v.updates[v.currentUpdate].data

  mat4.identity(m)
  mat4.translate(m, m, [263, 131, 0])
  mat4.scale(m, m, [24/14, 24/14, 1])
  defaultFont.draw(0,0, updatePostedAsOf(data.created_at * 1000, true), v.subtitleColor, v.mat, m)

  let t,tw,th,ts

  t = `${data.kind} · ${(''+kindInfo.filter(r=>r.kindMax?r.kind<=data.kind&&data.kind<=r.kindMax:r.kind==data.kind)?.[0]?.desc).toUpperCase()}`
  // tw = defaultFont.calcWidth(t)
  // ts = 20/14
  // mat4.identity(m)
  // mat4.translate(m, m, [15, 200, 0])
  mat4.scale(m, m, [0.85, 0.85, 1])
  defaultFont.draw(20,0, t, alpha(colors.inactive, 0.5), v.mat, m)

  if (pageTurn) {
    v.currentUpdate += 1
    v.lastTime = 0
    if (v.currentUpdate >= v.updates.length) {
      if (v.pendingUpdates.length > 0) {
        console.log(`switching to ${v.pendingUpdates[0]}`)
        v.parent.setContext(v.pendingUpdates, v.pendingUpdates[0].hpub)
        v.parent.relayout()
      } else {
        setTimeout(() => {
          v.backGad.clickFunc()
        })
      }
    }
  }

}
