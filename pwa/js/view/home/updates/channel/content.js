import { markUpdateAsViewed } from '../../../../content.js'
import { blend } from '../../../../draw.js'
import { render_kind1 } from './kind/1-short-text-note.js'
import { render_kind30023 } from './kind/30023-long-form-note.js'

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
  v.hpub = hpub
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
  const hexColor = hpub[61] + hpub[61] + hpub[62] + hpub[62] + hpub[63] + hpub[63]
  const rgbColor = parseInt(hexColor,16)
  const bgColor = [((~~(rgbColor/0x10000))&0xff)/0xff, ((~~(rgbColor/0x100))&0xff)/0xff, ((~~(rgbColor/0x1))&0xff)/0xff, 1]
  v.bgColor = blend(bgColor, [0,0,0,1], 0.25)

  const data = v.updates[0]?.data || { kind: -1, id: '0000000000000000000000000000000000000000000000000000000000000000' }
  if (data.kind == 1) {
    v.render_kind1(data)
    if (data.id != v.lastRenderedId) {
      v.lastRenderedId = data.id
      if (data.tags.filter(t => !['bgcolor', 'expiration', 'encryption'].includes(t[0])).length > 0) {
        console.log(`[NOTE] unrecognized tags are present:`, data)
      }
    }
  } else if (data.kind == 30023) {
    v.render_kind30023(data)
    if (data.id != v.lastRenderedId) {
      v.lastRenderedId = data.id
      if (data.tags.filter(t => !['bgcolor', 'expiration', 'encryption'].includes(t[0])).length > 0) {
        console.log(`[NOTE] unrecognized tags are present:`, data)
      }
    }
  } else {
    v.renderDefault(data)
    if (data.kind != -1 && data.id != v.lastRenderedId) {
      v.lastRenderedId = data.id
      console.log(`[NOTE] unrecognized kind:`, data)
    }
  }

  if (data.kind != -1) {
    markUpdateAsViewed(data.id, data.pubkey, data.created_at * 1000)
  }

}
let debug = false
v.render_kind1 = function(data) { return render_kind1(this, data) }
v.render_kind30023 = function(data) { return render_kind30023(this, data) }

v.renderDefault = function(data) {
  const v = this
  const encryption = data.tags?.filter(t => t[0] == 'encryption')?.[0]?.[1] || ''
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const m = mat4.create()
  let i = 0
  let n = data.tags?.length || 0
  data.tags?.map(t => {
    const line = t.join(': ')
    const th = 50
    const ts = th/2/14
    mat4.identity(m)
    mat4.translate(m, m, [50, (v.sh - th*n)/2 + th*i, 0])
    mat4.scale(m, m, [ts, ts, 1])
    defaultFont.draw(0,0, line, v.textColor, v.mat, m)
    i++
  })
}