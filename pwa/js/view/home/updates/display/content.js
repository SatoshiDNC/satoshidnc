import { overlayView } from './overlay.js'
import { markUpdateAsViewed } from '../../../../content.js'

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.bgColor = [0,0,0, 1]
v.textColor = [1,1,1,1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.subtitleColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
v.buttonFaceColor = colors.accentButtonFace
v.buttonTextColor = colors.accentButtonText
v.gadgets.push(g = v.screenGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
v.setContext = function(updates) {
  const v = this
  v.updates = updates
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
  const data = v.updates[overlayView.currentUpdate].data
  if (data.kind == 1) {
    v.renderKind1(data)
    if (data.id != v.lastRenderedId) {
      v.lastRenderedId = data.id
      if (data.tags.length > 0) {
        console.log(`[NOTE] tags are present:`, data)
      }
    }
  } else {
    gl.clearColor(...v.bgColor)
    gl.clear(gl.COLOR_BUFFER_BIT)
    if (data.id != v.lastRenderedId) {
      v.lastRenderedId = data.id
      console.log(`[NOTE] unrecognized kind:`, data)
    }
  }

  markUpdateAsViewed(data.id, data.created_at * 1000)

}
v.renderKind1 = function(data) {
  const v = this
  const bgColor = [parseInt(data.id[61],16)/64, parseInt(data.id[62],16)/64, parseInt(data.id[63],16)/64, 1]
  gl.clearColor(...bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)  
  const m = mat4.create()
  let t,tw,th,ts
  ts = 50/14
  const words = data.content.split(' ')
  const lines = []
  while (words.length > 0) {
    lines.push(words.shift())
    while (words.length > 0 && defaultFont.calcWidth(lines[lines.length-1] + ' ' + words[0]) * ts <= v.sw) {
      lines.push(lines.pop() + ' ' + words.shift())
    }
  }
  // tw = lines.reduce((a,c) => Math.max(a, defaultFont.calcWidth(c) * ts, 0))
  th = lines.length * defaultFont.glyphHeights[65] * ts * 2
  let i = 1
  for (let line of lines) {
    i++
    tw = defaultFont.calcWidth(line) * ts
    mat4.identity(m)
    mat4.translate(m, m, [(v.sw - tw)/2, (v.sh - th)/2 + i*defaultFont.glyphHeights[65]*ts*2, 0])
    mat4.scale(m, m, [ts, ts, 1])
    defaultFont.draw(0,0, line, v.textColor, v.mat, m)
  }
}