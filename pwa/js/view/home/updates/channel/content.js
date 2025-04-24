import { markUpdateAsViewed } from '../../../../content.js'
import { drawRoundedRect, blend } from '../../../../draw.js'
import { prep_kind1 } from './kind/1-short-text-note.js'
import { prep_kind30023 } from './kind/30023-long-form-note.js'

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
    if (!p.type) {
      if (p.preloaded.data.kind == 1) {
        prep_kind1(v, p)
      } else if (p.preloaded.data.kind == 30023) {
        prep_kind30023(v, p)
      } else {
        console.log(`no rendering implemented:`, p)
        p.type = 'error'
      }
    }
    if (p.type == 'default') {
      v.render_default(p)
    }
    y -= SPACE_BELOW+total_height+SPACE_ABOVE
  }
}
v.render_default = function(post) {
  const v = this, p = post

  let total_height = TEXT_SPACE_BELOW + TEXT_HEIGHT + (p.lines.length - 1) * TEXT_LINE_SPACING + TEXT_SPACE_ABOVE
  drawRoundedRect(v, v.bubbleColor, BUBBLE_RADIUS, SPACE_LEFT,v.sh-y-SPACE_BELOW-total_height, v.sw-SPACE_LEFT-SPACE_RIGHT,total_height)

  let line_offset = p.lines.length
  for (const line of p.lines) {
    line_offset -= 1
    mat4.identity(m)
    mat4.translate(m, m, [SPACE_LEFT+TEXT_SPACE_LEFT, v.sh-y-SPACE_BELOW-TEXT_SPACE_BELOW-line_offset*TEXT_LINE_SPACING, 0])
    mat4.scale(m, m, [ts, ts, 1])
    defaultFont.draw(0,0, line, v.textColor, v.mat, m)
  }
}
