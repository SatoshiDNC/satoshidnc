import { overlayView } from './overlay.js'
import { markUpdateAsViewed } from '../../../../content.js'

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.bgColorDefault = [0,0,0, 1]
v.bgColor = v.bgColorDefault
v.textColor = [1,1,1,1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.subtitleColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
v.buttonFaceColor = colors.accentButtonFace
v.buttonTextColor = colors.accentButtonText
v.gadgets.push(g = v.screenGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
v.setContext = function(updates, hpub) {
  const v = this
  v.pendingUpdates = updates.filter(u => u.hpub != hpub)
  v.updates = updates.filter(u => u.hpub == hpub)
  v.startTime = 0
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
  v.bgColor = v.bgColorDefault
  const data = v.updates[overlayView.currentUpdate]?.data || { kind: -1, id: '0000000000000000000000000000000000000000000000000000000000000000' }
  if (data.kind == 1) {
    v.renderKind1(data)
    if (data.id != v.lastRenderedId) {
      v.lastRenderedId = data.id
      if (data.tags.filter(t => !['bgcolor', 'expiration'].includes(t[0])).length > 0) {
        console.log(`[NOTE] unrecognized tags are present:`, data)
      }
    }
  } else {
    gl.clearColor(...v.bgColor)
    gl.clear(gl.COLOR_BUFFER_BIT)
    if (data.kind != -1 && data.id != v.lastRenderedId) {
      v.lastRenderedId = data.id
      console.log(`[NOTE] unrecognized kind:`, data)
    }
  }

  markUpdateAsViewed(data.id, data.pubkey, data.created_at * 1000)

}
v.renderKind1 = function(data) {
  const v = this
  const whitespace = true
  const hexColor = data.tags.filter(t => t[0] == 'bgcolor')?.[0]?.[1] || data.id[61] + data.id[61] + data.id[62] + data.id[62] + data.id[63] + data.id[63]
  const rgbColor = parseInt(hexColor,16)
  const bgColor = [((~~(rgbColor/0x10000))&0xff)/0xff, ((~~(rgbColor/0x100))&0xff)/0xff, ((~~(rgbColor/0x1))&0xff)/0xff, 1]
  v.bgColor = bgColor
  gl.clearColor(...bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)  
  const m = mat4.create()
  let t,tw,th,ts
  ts = 50/14
  //const paragraphs = data.content.replaceAll('\x0a', `${whitespace?'¶':''}\x0a`).split('\x0a')
  const paragraphs = '\x01\xf6\x0a'
  const lines = []
  for (const para of paragraphs) {
    const words = para.split(' ')
    while (words.length > 0) {
      lines.push(words.shift())
      while (lines[lines.length-1] && defaultFont.calcWidth(lines[lines.length-1]) * ts >= v.sw) {
        let buf = ''
        while (lines[lines.length-1] && defaultFont.calcWidth(lines[lines.length-1]) * ts >= v.sw) {
          let l = lines.pop()
          buf = l.substring(l.length-1) + buf
          l = l.substring(0, l.length-1)
          lines.push(l)
        }
        lines.push(buf)
      }
      while (words.length > 0 && defaultFont.calcWidth(lines[lines.length-1] + ' ' + words[0]) * ts <= v.sw) {
        lines.push(lines.pop() + ' ' + words.shift())
      }
    }
  }
  // tw = lines.reduce((a,c) => Math.max(a, defaultFont.calcWidth(c) * ts, 0))
  th = lines.length * defaultFont.glyphHeights[65] * ts * 2
  let i = 1
  for (let line of lines) {
    i++
    if (!line) continue
    if (whitespace) {
      line = line.replaceAll(' ', '·')
    }
    tw = defaultFont.calcWidth(line) * ts
    mat4.identity(m)
    mat4.translate(m, m, [(v.sw - tw)/2, (v.sh - th)/2 + i*defaultFont.glyphHeights[65]*ts*2, 0])
    mat4.scale(m, m, [ts, ts, 1])
    defaultFont.draw(0,0, line, v.textColor, v.mat, m)
  }
}