import { contacts, contactViewDependencies } from '../../../contacts.js'
import { drawPill, drawAvatar, drawEllipse, drawRect } from '../../../draw.js'
import { contentView as chatRoomView } from '../../chat-room/content.js'
import { getPersonalData as getAttr } from '../../../personal.js'
import { addedOn, updatePostedAsOf } from '../../util.js'
import { getUpdates } from '../../../content.js'
import { rootView as displayView } from './display/root.js'

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.splashMode = 0
v.frameTimes = []
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.textColor = [1,1,1,1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.subtitleColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
v.gadgets.push(g = v.recentsGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    const x = (e.x - v.x) / v.viewScale - v.x, y = (e.y - v.y) / v.viewScale
    const index = Math.floor((y - g.y) / 200)
    if (index < 0 || index >= v.recents.length) return
    const updates = v.query.results.filter(u => u.hpub == v.recents[index])
    displayView.setContext(updates)
    g.root.easeOut(g.target)
  }
v.gadgets.push(g = v.viewedGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    const x = (e.x - v.x) / v.viewScale - v.x, y = (e.y - v.y) / v.viewScale
    const index = Math.floor((y - g.y) / 200)
    if (index < 0 || index >= v.viewed.length) return
    const updates = v.query.results.filter(u => u.hpub == v.viewed[index])
    displayView.setContext(updates)
    g.root.easeOut(g.target)
  }
v.query = { inProgress: false, lastCompleted: 0, results: [] }
v.queryFunc = function() {
  const v = this
  const ONE_MINUTE_IN_MILLISECONDS = 1 * 60 * 1000
  if (!v.query.inProgress && v.query.lastCompleted < Date.now() - ONE_MINUTE_IN_MILLISECONDS) {
    v.query.inProgress = true
    getUpdates().then(updates => {
      v.query.inProgress = false
      v.query.lastCompleted = Date.now()
      v.query.results = updates
      v.relayout()
    })
  }
}
v.layoutFunc = function() {
  const v = this

  const recents = []
  const viewed = []
  for (const update of v.query.results) {
    if (!update.viewed) {
      if (!recents.includes(update.hpub)) {
        recents.push(update.hpub)
        const index = viewed.indexOf(update.hpub)
        if (index > -1) {
          viewed.splice(index, 1)
        }
      }
    } else {
      if (!recents.includes(update.hpub)) {
        viewed.push(update.hpub)
      }
    }
  }
  v.recents = recents
  v.viewed = viewed

  let x = 42
  let g
  g = v.recentsGad
  g.x = 0, g.y = 466
  g.w = v.sw, g.h = recents.length * 200
  g.autoHull()
  g = v.viewedGad
  g.x = 0, g.y = v.recentsGad.y + v.recentsGad.h + 96
  g.w = v.sw, g.h = viewed.length * 200
  g.autoHull()

  v.queryFunc()
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)  
  const m = mat4.create()
  const mat = mat4.create()

  mat4.identity(m)
  mat4.translate(m, m, [45, 125, 0])
  mat4.scale(m, m, [41/14, 41/14, 1])
  let x = 0, y = 0
  defaultFont.draw(x,y, 'Status', v.textColor, v.mat, m)

  mat4.identity(m)
  mat4.translate(m, m, [45, 434, 0])
  mat4.scale(m, m, [28/14, 28/14, 1])
  defaultFont.draw(x,y, 'Recent updates', v.subtitleColor, v.mat, m)

  const recents = []
  const viewed = []
  let i = 0
  for (let hpub of [...v.recents, ...v.viewed]) {
    const numUpdates = v.query.results.filter(u => u.hpub == hpub).length
    const newest = v.query.results.filter(u => u.hpub == hpub).reduce((a,c) => Math.max(a,c.data.created_at * 1000), 0)
    const numViewed = v.query.results.filter(u => u.hpub == hpub).reduce((a,c) => Math.max(a,c.viewed?1:0), 0)
    i++
    const y = i * 200 + v.viewed.includes(hpub)? 96: 0
    drawEllipse(v, colors.accent, 32, 492 + y, 147, 147)
    if (numViewed) {
      drawEllipse(v, colors.inactive, 32, 492 + y + 147, 147, -147, numViewed/numUpdates, -numViewed/numUpdates)
    }
    drawEllipse(v, v.bgColor, 38, 498 + y, 135, 135)
    if (numUpdates > 1) for (let i = 0; i < numUpdates; i++) {
      // drawRect(v, v.bgColor, 105 - 3, 491, 6, 8)
      mainShapes.useProg2()
      gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(v.bgColor))
      gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
      mat4.identity(m)
      mat4.translate(m,m, [105, 565.5 + y, 0])
      mat4.rotate(m,m, 2*Math.PI*i/numUpdates, [0, 0, 1])
      mat4.translate(m,m, [-3, -74.5, 0])
      mat4.scale(m,m, [6, 8, 1])
      gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
      mainShapes.drawArrays2('rect')
    }

    // drawAvatar(v, hpub, 43,503 + y, 125,125)
    drawEllipse(v, colors.inactiveDark, 43, 503 + y, 125, 125)

    mat4.identity(m)
    mat4.translate(m, m, [211, 553 + y, 0])
    mat4.scale(m, m, [35/14, 35/14, 1])
    defaultFont.draw(0,0, getAttr(hpub, 'name'), v.titleColor, v.mat, m)
  
    mat4.identity(m)
    mat4.translate(m, m, [211, 618 + y, 0])
    mat4.scale(m, m, [30/14, 30/14, 1])
    defaultFont.draw(0,0, updatePostedAsOf(newest), v.subtitleColor, v.mat, m)
  }
  // for (const update of v.query.results) {
  //   if (!update.viewed) {
  //     if (!recents.includes(update.hpub)) {
  //       recents.push(update.hpub)
  //       const index = viewed.indexOf(update.hpub)
  //       if (index > -1) {
  //         viewed.splice(index, 1)
  //       }

  //     }
  //   } else {
  //     if (!recents.includes(update.hpub)) {
  //       viewed.push(update.hpub)
  //     }
  //   }
  // }

  mat4.identity(m)
  mat4.translate(m, m, [45, 434 + recents.length * 200 + 98, 0])
  mat4.scale(m, m, [28/14, 28/14, 1])
  defaultFont.draw(x,y, 'Viewed updates', v.subtitleColor, v.mat, m)

  for (const hpub of viewed) {
    drawAvatar(v, hpub, 43,503 + y, 125,125)

    mat4.identity(m)
    mat4.translate(m, m, [211, 553 + y, 0])
    mat4.scale(m, m, [35/14, 35/14, 1])
    defaultFont.draw(0,0, getAttr(hpub, 'name'), v.titleColor, v.mat, m)
  
    mat4.identity(m)
    mat4.translate(m, m, [211, 618 + y, 0])
    mat4.scale(m, m, [30/14, 30/14, 1])
    defaultFont.draw(0,0, updatePostedAsOf(v.query.results.filter(u => u.hpub == hpub)[0].firstSeen), v.subtitleColor, v.mat, m)
  }

}

export const overlayView = v = new fg.View(null)
v.name = Object.keys({overlayView}).pop()
v.designSize = 1080*1825
v.bgColor = [0x12/0xff, 0x1b/0xff, 0x22/0xff, 1]
v.buttonFaceColor = colors.accentButtonFace
v.buttonTextColor = colors.accentButtonText
v.gadgets.push(g = v.addGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '+'
  g.clickFunc = function() {
    const g = this, v = this.viewport
    g.root.easeOut(g.target)
  }
v.layoutFunc = function() {
  const v = this
  let g
  g = v.addGad
  g.x = v.sw-189
  g.y = v.sh-189
  g.w = 147
  g.h = 147
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  const m = mat4.create()
  const g = v.addGad
  mat4.identity(m)
  mat4.translate(m,m, [g.x, g.y + g.h, 0])
  mat4.scale(m,m, [g.w/6, g.h/6, 1])
  iconFont.draw(0,0, `\x0a`, v.buttonFaceColor, v.mat, m)
  mat4.identity(m)
  mat4.translate(m,m, [g.x + 49, g.y + 95, 0])
  mat4.scale(m,m, [51/11, 51/11, 1])
  iconFont.draw(-2,0, g.label, v.buttonTextColor, v.mat, m)
}
