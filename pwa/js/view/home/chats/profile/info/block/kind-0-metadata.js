import { alpha } from '../../../../../../draw.js'
import { kindInfo } from '../../../../../../nostor-util.js'

export function kind0(v, post) {

  if (!post) {
    let index = v.gadgets.findIndex(o => o.key == 'profile')
    if (index >= 0) {
      v.gadgets.splice(index, 2)
      fixedGads -= 2
    }
    v.relayout()
    return
  }

  if (post.data.kind !== 0) {
    return
  }

  let g

  const g1 = g = new fg.Gadget(v)
  g.key = 'profile'
  g.type = '-', g.h = 22
  g.renderFunc = v.lastSep.renderFunc

  const rowHeight = 42

  const g2 = g = new fg.Gadget(v)
  g.type = 'post'
  g.actionFlags = fg.GAF_CLICKABLE
  g.data = post.data
  try {
    g.content = JSON.parse(g.data.content)
  } catch {
    g.content = g.data.content
  }
  g.h = 50 + rowHeight * Object.keys(g.content).length + 15
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

    let y = 50
    for (const key of Object.keys(g.content)) {
      const color = ['displayName', 'username'].includes(key)? v.titleColorDeprecated: v.titleColor
      t = `${key}: ${g.content[key]}`
      ts = 32/14
      mat4.identity(mat)
      mat4.translate(mat, mat, [15, g.y + y + rowHeight, 0])
      mat4.scale(mat, mat, [ts, ts, 1])
      defaultFont.draw(0,0, t, color, v.mat, mat)
      y += rowHeight
    }
  }

  let index = v.gadgets.findIndex(o => o.key == 'profile')
  if (index >= 0) {
    v.gadgets.splice(index, 2, g1, g2)
  } else {
    v.gadgets.splice(v.fixedGads, 0, g1, g2)
    v.fixedGads += 2
  }
  v.relayout()
}