import { alpha, drawRect } from '../../../../../../draw.js'
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

  const textHeight = 32
  const rowHeight = 12 + textHeight * 1.5
  const imageSize = 316

  const g2 = g = new fg.Gadget(v)
  g.type = 'post'
  g.actionFlags = fg.GAF_CLICKABLE
  g.data = post.data
  try {
    g.content = JSON.parse(g.data.content)
  } catch {
    g.content = g.data.content
  }
  g.keys = []
  for (const remaining of Object.keys(g.content)) {
    let duplicate = false
    for (const key of g.keys) {
      if (key[1] === g.content[remaining]) {
        key[0].push(remaining)
        duplicate = true
      }
    }
    if (!duplicate) {
      g.keys.push([[remaining], g.content[remaining]])
    }
  }
  g.h = 50 + rowHeight * (g.keys.length - 1) + 15 + Math.max(rowHeight, imageSize + 12 + textHeight * 0.5)
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
    const displayStandardLine = (key, keyName) => {
      const t1 = `${keyName||key}:`
      const t2 = `${g.content[key]}`
      let t3 = ''
      if (key === 'created_at' && `${g.content[key]}` === `${+g.content[key]}`) {
        t3 = new Date(g.content[key] * 1000).toLocaleString()
      }
      let ts = textHeight/14 * 0.5
      mat4.identity(mat)
      mat4.translate(mat, mat, [15, g.y + y + 5 + textHeight * 0.5, 0])
      mat4.scale(mat, mat, [ts, ts, 1])
      defaultFont.draw(0,0, t1, colors.inactive, v.mat, mat)
      ts = textHeight/14
      mat4.identity(mat)
      mat4.translate(mat, mat, [15, g.y + y + 7 + textHeight * 1.5, 0])
      mat4.scale(mat, mat, [ts, ts, 1])
      defaultFont.draw(0,0, t2 + ' ' + t3, colors.title, v.mat, mat)
      if (t3) {
        defaultFont.draw(0,0, ' / ', colors.inactive, v.mat, mat)
        defaultFont.draw(0,0, t3, colors.title, v.mat, mat)
      }
      y += rowHeight
    }
    const displayPictureLine = (key, keyName) => {
      const t1 = `${keyName||key}:`
      const ts = textHeight/14 * 0.5
      mat4.identity(mat)
      mat4.translate(mat, mat, [15, g.y + y + 5 + textHeight * 0.5, 0])
      mat4.scale(mat, mat, [ts, ts, 1])
      defaultFont.draw(0,0, t1, colors.inactive, v.mat, mat)
      const is = imageSize
      drawRect(v, themeColors.inactiveDark, 15, g.y + y + 7 + textHeight * 0.5 - 14 * ts + textHeight * 0.5, is, is)
      y += Math.max(rowHeight, is + 12 + textHeight * 0.5)
    }
    for (const key of g.keys) {
      if (key[0].includes('picture')) {
        displayPictureLine(key[0][0], key[0].join(' / '))
      } else {
        displayStandardLine(key[0][0], key[0].join(' / '))
      }
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