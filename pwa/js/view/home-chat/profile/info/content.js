import { setEasingParameters } from '../../../util.js'
import { drawAvatar, alpha } from '../../../../draw.js'
import { getPersonalData as get } from '../../../../personal.js'
import { pingFeed, getFeed } from '../../../../content.js'
import { kindInfo } from '../../../../nostor.js'

const TAG = 'INFO'

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.designSize = 1080 * 2183
v.splashMode = 0
v.frameTimes = []
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.hintColor = [0xb5/0xff, 0xb9/0xff, 0xbc/0xff, 1]
v.textColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.iconColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
v.gadgets.push(g = v.backGad = new fg.Gadget(v))
  g.type = 'header'
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '\x08'
  g.x = 43, g.absY = 52
  g.w = 42, g.h = 42
  g.font = iconFont
  g.fontSize = 13
  g.autoHull()
  g.clickFunc = function() {
    const g = this, v = this.viewport
    g.root.easeOut(g.target)
  }
v.gadgets.push(g = v.menuGad = new fg.Gadget(v))
  g.type = 'header'
  g.actionFlags = fg.GAF_CLICKABLE
  g.absY = 51
  g.label = ':'
  g.font = iconFont
  g.fontSize = 11
  g.handler = function(item) {
    cas
    console.log(`id ${JSON.stringify(item)}`)
  }
  g.items = [
    { id: 1, label: 'Copy id', handler: () => { navigator.clipboard.writeText(v.contact.hpub).catch(e => console.error(e)) } },
    { id: 2, handler: g.handler, label: 'View contact' },
    { id: 3, handler: g.handler, label: 'Media, links, and docs' },
    { id: 4, handler: g.handler, label: 'Search' },
    { id: 5, handler: g.handler, label: 'Mute notifications' },
    { id: 6, handler: g.handler, label: 'Disappearing messages' },
    { id: 7, handler: g.handler, label: 'Wallpaper' },
    { id: 8, handler: g.handler, label: 'More' },
  ]
  g.clickFunc = function() {
    const g = this, v = this.viewport
    if (fg.getRoot() !== g.target || g.target.easingState() == -1) {
      g.target?.easeIn?.(g.items)
    } else {
      g.target?.easeOut?.()
    }
  }
v.gadgets.push(g = v.lawGad = new fg.Gadget(v))
  g.type = 'header'
  g.actionFlags = fg.GAF_CLICKABLE
  g.absY = 51
  g.label = '='
  g.font = iconFont
  g.fontSize = 11
  g.clickFunc = function() {
    const g = this, v = this.viewport
    console.log(`click '${g.label}'`)
  }
const fixedGads = v.gadgets.length
v.gadgets.push(g = v.lastSep = new fg.Gadget(v))
g.type = '-', g.h = 22
g.renderFunc = function() {
  const g = this, v = g.viewport
  const m = mat4.create()
  mainShapes.useProg2()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array([0,0,0,1]))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [0, g.y, 0])
  mat4.scale(m,m, [v.sw, g.h, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')
}
v.gadgets.push(g = v.swipeGad = new fg.SwipeGadget(v))
  g.actionFlags = fg.GAF_SWIPEABLE_UPDOWN|fg.GAF_SCROLLABLE_UPDOWN
const tailGads = v.gadgets.length - fixedGads - 1
v.setContact = function(hpub) {
  const v = this
  v.hpub = hpub
  v.userY = 0
  v.deltaTime = undefined
  v.gadgets.splice(fixedGads, v.gadgets.length - fixedGads - tailGads - 1)
  pingFeed(v.hpub)
  getFeed(v.hpub).then(posts => {
    for (const post of posts) {
      let g

      const g1 = g = new fg.Gadget(v)
      g.type = '-', g.h = 22
      g.renderFunc = v.lastSep.renderFunc

      const g2 = g = new fg.Gadget(v)
      g.type = 'post', g.h = 500
      g.actionFlags = fg.GAF_CLICKABLE
      g.data = post.data
      g.clickFunc = function() {
        const g = this, v = g.viewport, e = g.data
        if (e.kind == 31338) {
          console.log('play', e)
          const url = e.tags.filter(t=>t[0]=='imeta'&&t[1].startsWith('url '&&t[1].endsWith('.mp3')))?.[0]
          if (url) {
            new Audio(url).play()
          } else {
            console.error('URL not found.')
          }
        } else {
          console.log('click', e)
        }
      }
      g.renderFunc = function() {
        const g = this, v = g.viewport
        const mat = mat4.create()
        let t,tw,ts

        t = `${g.data.kind} · ${(''+kindInfo.filter(r=>r.kindMax?r.kind<=g.data.kind&&g.data.kind<=r.kindMax:r.kind==g.data.kind)?.[0]?.desc).toUpperCase()}`
        tw = defaultFont.calcWidth(t)
        ts = 20/14
        mat4.identity(mat)
        mat4.translate(mat, mat, [15, g.y + 15 + 20, 0])
        mat4.scale(mat, mat, [ts, ts, 1])
        defaultFont.draw(0,0, t, alpha(colors.inactive, 0.5), v.mat, mat)
      }

      v.gadgets.splice(v.gadgets.length - tailGads - 1, 0, g1, g2)
    }
    v.relayout()
  })
}
v.layoutFunc = function() {
  const v = this
  v.minX = 0, v.maxX = v.sw
  v.minY = 0, v.maxY = v.sh*2
  let g
  g = v.backGad
  g.y = g.absY + v.userY
  g.autoHull()
  g = v.menuGad
  g.y = g.absY + v.userY
  g.w = 12
  g.h = 45
  g.x = v.sw - 52 - g.w
  g.autoHull()
  g = v.lawGad
  g.y = g.absY + v.userY
  g.w = 45
  g.h = 45
  g.x = v.menuGad.x - 52 - g.w
  g.autoHull()

  const todo = v.gadgets.splice(fixedGads, v.gadgets.length)
  const tail = todo.splice(todo.length - tailGads, todo.length)

  let y = 808
  for (g of todo) {
    g.x = 0, g.y = y
    g.w = v.sw
    v.gadgets.push(g)
    y += g.h
    g.autoHull()
  }

  v.gadgets.push(...tail)

  v.maxY = y

  g = v.swipeGad
  g.layout.call(g)
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const m = mat4.create()
  const mat = mat4.create()

  const f1 = Math.max(0, Math.min(v.userY / 331, 1))
  const f0 = 1 - f1

  let t,tw,ts

  t = ''+v.deltaTime
  tw = defaultFont.calcWidth(t)
  ts = 37/14
  mat4.identity(mat)
  mat4.translate(mat, mat, [(v.sw - tw * ts) / 2, 515, 0])
  mat4.scale(mat, mat, [ts, ts, 1])
  defaultFont.draw(0,0, t, colors.inactive, v.mat, mat)

  for (g of v.gadgets) {
    g.renderFunc?.()
  }

  // header background
  mainShapes.useProg2()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(alpha(v.bgColor, f1)))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [0, v.userY, 0])
  mat4.scale(m,m, [v.sw, 147, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')

  // subtle divider line
  mainShapes.useProg2()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(alpha(colors.inactiveDark, f1)))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [0, v.userY + 147-2, 0])
  mat4.scale(m,m, [v.sw, 2, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')

  for (g of v.gadgets) if (g.type == 'header') {
    let gy = g.y
    if ([v.backGad, v.lawGad, v.menuGad].includes(g)) {
      gy = g.absY + v.userY
    }
    mat4.identity(mat)
    mat4.translate(mat, mat, [g.x, gy+g.h, 0])
    mat4.scale(mat, mat, [g.h/g.fontSize, g.h/g.fontSize, 1])
    g.font.draw(0,0, g.label, v.textColor, v.mat, mat)
  }

  const hpub = v.hpub
  drawAvatar(v, hpub, (v.sw-316)/2 * f0 + 129 * f1, 30 * f0 + 17 * f1 + v.userY, 316 * f0 + 114 * f1, 316 * f0 + 114 * f1)

  t = get(hpub, 'name') || 'Unnamed'
  tw = defaultFont.calcWidth(t)
  ts = 49/14 * f0 + 45/14 * f1
  mat4.identity(mat)
  mat4.translate(mat, mat, [(v.sw - tw * ts) / 2 * f0 + 277 * f1, 430 * f0 + 98 * f1 + v.userY, 0])
  mat4.scale(mat, mat, [ts, ts, 1])
  defaultFont.draw(0,0, t, v.textColor, v.mat, mat)

  v.renderFinish() // kludge
}
setEasingParameters(v)