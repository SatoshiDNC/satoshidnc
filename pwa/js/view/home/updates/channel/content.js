import { markUpdateAsViewed } from '../../../../content.js'
import { drawRoundedRect, blend } from '../../../../draw.js'
import { render_kind1 } from './kind/1-short-text-note.js'
import { render_kind30023 } from './kind/30023-long-form-note.js'

const SPACE_ABOVE = 11
const SPACE_BELOW = 84
const SPACE_LEFT = 44
const SPACE_RIGHT = 43
const BUBBLE_RADIUS = 32
const TEXT_SPACE_ABOVE = 26
const TEXT_SPACE_BELOW = 31
const TEXT_SPACE_LEFT = 30
const TEXT_SPACE_RIGHT = 30
const TEXT_HEIGHT = 33
const TEXT_LINE_SPACING = 54

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.bgColorDefault = [0,0,0, 1]
v.bgColor = v.bgColorDefault
v.bubbleColor = colors.bubble
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
  v.updates = updates.filter(u => u.hpub == hpub)
  v.startTime = 0
  console.log(v.updates)
  v.posts = []
  for (const u of v.updates) {
    v.insertPost(u)
  }
}
v.insertPost = function(preloaded) {
  v.posts.push({ preloaded })
}
v.layoutFunc = function() {
  const v = this
  let g
  g = v.screenGad
  g.x = 0, g.y = 0
  g.w = v.sw, g.h = v.sh
  g.autoHull()

  // remove cached fields to force re-calculation on re-draw
  const reset_posts = []
  for (const p of v.posts) {
    reset_posts.push({ preloaded: p.preloaded })
  }
  v.posts = reset_posts
}
v.renderFunc = function() {
  const v = this
  v.bgColor = v.bgColorDefault
  const hexColor = v.hpub[61] + v.hpub[61] + v.hpub[62] + v.hpub[62] + v.hpub[63] + v.hpub[63]
  const rgbColor = parseInt(hexColor,16)
  const bgColor = [((~~(rgbColor/0x10000))&0xff)/0xff, ((~~(rgbColor/0x100))&0xff)/0xff, ((~~(rgbColor/0x1))&0xff)/0xff, 1]
  v.bgColor = blend([0,0,0,1], bgColor, 0.15)
  v.bubbleColor = blend([0,0,0,1], bgColor, 0.25)
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const m = mat4.create()

  let y = 0
  for (const p of v.posts) {

    // re-calculate geometry on first re-draw
    if (!p.lines) {
      let lines = []

      const plaintext = p.preloaded.data.content
      const whitespace = false
      const paragraphs = plaintext.replaceAll('\x0a', `${whitespace?'¶':''}\x0a`).split('\x0a')

      for (const para of paragraphs) {
        if (debug) console.log(`for (const para ${para} of paragraphs ${paragraphs}) {`)
        const words = para.split(' ')
        if (debug) console.log(`while (words.length ${words.length} > 0) {`)
        while (words.length > 0) {
          lines.push(words.shift())
          if (debug) console.log(`while (lines[lines.length-1] ${lines[lines.length-1]} && defaultFont.calcWidth(lines[lines.length-1]) ${defaultFont.calcWidth(lines[lines.length-1])} * ts ${ts} >= v.sw ${v.sw}) {`)
          while (lines[lines.length-1] && defaultFont.calcWidth(lines[lines.length-1]) * ts >= v.sw) {
            let buf = ''
            if (debug) console.log(`while (lines[lines.length-1] ${lines[lines.length-1]} && defaultFont.calcWidth(lines[lines.length-1]) ${defaultFont.calcWidth(lines[lines.length-1])} * ts ${ts} >= v.sw ${v.sw}) {`)
            while (lines[lines.length-1] && defaultFont.calcWidth(lines[lines.length-1]) * ts >= v.sw) {
              let l = lines.pop()
              buf = l.substring(l.length-1) + buf
              l = l.substring(0, l.length-1)
              lines.push(l)
            }
            lines.push(buf)
          }
          if (debug) console.log(`while (words.length ${words.length} > 0 && defaultFont.calcWidth(lines[lines.length-1] + ' ' + words[0]) ${defaultFont.calcWidth(lines[lines.length-1] + ' ' + words[0])} * ts ${ts} <= v.sw ${v.sw}) {`)
          while (words.length > 0 && defaultFont.calcWidth(lines[lines.length-1] + ' ' + words[0]) * ts <= v.sw) {
            lines.push(lines.pop() + ' ' + words.shift())
          }
        }
      }
      p.lines = lines
    }

    let total_height = TEXT_SPACE_BELOW + TEXT_HEIGHT + (p.lines.length - 1) * TEXT_LINE_SPACING + TEXT_SPACE_ABOVE
    drawRoundedRect(v, v.bubbleColor, BUBBLE_RADIUS, SPACE_LEFT,v.sh-y-SPACE_BELOW-total_height, v.sw-SPACE_LEFT-SPACE_RIGHT,total_height)

    let line = p.lines[0]
    let ts = TEXT_HEIGHT/14
    mat4.identity(m)
    mat4.translate(m, m, [SPACE_LEFT+TEXT_SPACE_LEFT, v.sh-y-SPACE_BELOW-TEXT_SPACE_BELOW, 0])
    mat4.scale(m, m, [ts, ts, 1])
    defaultFont.draw(0,0, line, v.textColor, v.mat, m)


    y -= SPACE_BELOW+total_height+SPACE_ABOVE
  }

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