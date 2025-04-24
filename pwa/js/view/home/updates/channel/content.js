import { getFeed, markUpdateAsViewed } from '../../../../content.js'
import { drawRoundedRect, blend } from '../../../../draw.js'
import { prep_kind1 } from './kind/1-short-text-note.js'
import { prep_kind30023 } from './kind/30023-long-form-note.js'
import * as geom from './geometry.js'
import { kindInfo } from '../../../../nostor-util.js'

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
v.previous_width = 0
v.gadgets.push(g = v.screenGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
v.gadgets.push(g = v.swipeGad = new fg.SwipeGadget(v))
  g.actionFlags = fg.GAF_SWIPEABLE_UPDOWN|fg.GAF_SCROLLABLE_UPDOWN
v.setContext = function(updates, hpub) {
  const v = this
  v.hpub = hpub
  v.updates = updates.filter(u => u.hpub == hpub)
  v.startTime = 0
  v.posts = []
  for (const u of v.updates) {
    v.insertPost(u)
  }
  getFeed(hpub).then(posts => {
    for (const p of posts) {
      v.insertPost(p)
    }
    v.setRenderFlag(true)
  })
}
v.insertPost = function(preloaded) {
  v.posts.push({ preloaded })
}
v.layoutFunc = function() {
  const v = this
  v.minX = 0, v.maxX = v.sw
  v.minY = Math.min(0, v.sh-v.posts.reduce((p,c)=>p+geom.SPACE_BELOW+(c.total_height?c.total_height:0)+geom.SPACE_ABOVE,0)), v.maxY = v.sh
  let g
  g = v.screenGad
  g.x = 0, g.y = 0
  g.w = v.sw, g.h = v.sh
  g.autoHull()

  if (v.sw != v.previous_width) {
    // remove cached fields to force re-calculation on width change
    const reset_posts = []
    for (const p of v.posts) {
      reset_posts.push({ preloaded: p.preloaded })
    }
    v.posts = reset_posts
    v.previous_width = v.sw
  }
  v.swipeGad?.layout()
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

  let y = 0
  for (const p of v.posts) {
    if (!p.type) {
      if (p.preloaded.data.kind == 1) {
        prep_kind1(v, p)
      } else if (p.preloaded.data.kind == 30023) {
        prep_kind30023(v, p)
      } else {
        p.lines = [ `Posted ${kindInfo.filter(r => p.preloaded.data.kind >= r.kind && p.preloaded.data.kind <= (r.kindMax || r.kind))?.[0].desc || 'something'}` ]
        p.total_height = geom.TEXT_SPACE_BELOW + geom.TEXT_HEIGHT + (p.lines.length - 1) * geom.TEXT_LINE_SPACING + geom.TEXT_SPACE_ABOVE
        p.type = 'notice'
      }
    }
    y += geom.SPACE_BELOW
    if (p.type == 'notice') {
      v.render_notice(p, y)
    } else if (p.type == 'default') {
      v.render_default(p, y)
    }
    y += p.total_height+geom.SPACE_ABOVE
  }
}
v.render_notice = function(post, y) {
  const v = this, p = post
  const m = mat4.create()

  let bubble_width = 0
  for (const line of p.lines) {
    const line_width = defaultFont.calcWidth(line)
    if (geom.TEXT_SPACE_LEFT + line_width*geom.TEXT_SCALE + geom.TEXT_SPACE_RIGHT > bubble_width) {
      bubble_width = geom.TEXT_SPACE_LEFT + line_width*geom.TEXT_SCALE + geom.TEXT_SPACE_RIGHT
    }
  }
  let x = geom.SPACE_LEFT+(v.sw-geom.SPACE_LEFT-geom.SPACE_RIGHT-bubble_width)/2
  drawRoundedRect(v, v.bubbleColor, geom.BUBBLE_RADIUS, x,v.sh-y-p.total_height, bubble_width,p.total_height)

  let line_offset = p.lines.length
  for (const line of p.lines) {
    line_offset -= 1
    if (v.sh-v.userY-y-geom.TEXT_SPACE_BELOW-line_offset*geom.TEXT_LINE_SPACING+geom.TEXT_HEIGHT < 0) { continue }
    if (v.sh-v.userY-y-geom.TEXT_SPACE_BELOW-line_offset*geom.TEXT_LINE_SPACING-geom.TEXT_HEIGHT > v.sh) { continue }
    mat4.identity(m)
    mat4.translate(m, m, [x+geom.TEXT_SPACE_LEFT, v.sh-y-geom.TEXT_SPACE_BELOW-line_offset*geom.TEXT_LINE_SPACING, 0])
    mat4.scale(m, m, [geom.TEXT_SCALE, geom.TEXT_SCALE, 1])
    defaultFont.draw(0,0, line, v.subtitleColor, v.mat, m)
  }
}
v.render_default = function(post, y) {
  const v = this, p = post
  const m = mat4.create()

  drawRoundedRect(v, v.bubbleColor, geom.BUBBLE_RADIUS, geom.SPACE_LEFT,v.sh-y-p.total_height, v.sw-geom.SPACE_LEFT-geom.SPACE_RIGHT,p.total_height)

  let line_offset = p.lines.length
  for (const line of p.lines) {
    line_offset -= 1
    if (v.sh-v.userY-y-geom.TEXT_SPACE_BELOW-line_offset*geom.TEXT_LINE_SPACING+geom.TEXT_HEIGHT < 0) { continue }
    if (v.sh-v.userY-y-geom.TEXT_SPACE_BELOW-line_offset*geom.TEXT_LINE_SPACING-geom.TEXT_HEIGHT > v.sh) { continue }
    mat4.identity(m)
    mat4.translate(m, m, [geom.SPACE_LEFT+geom.TEXT_SPACE_LEFT, v.sh-y-geom.TEXT_SPACE_BELOW-line_offset*geom.TEXT_LINE_SPACING, 0])
    mat4.scale(m, m, [geom.TEXT_SCALE, geom.TEXT_SCALE, 1])
    defaultFont.draw(0,0, line, v.textColor, v.mat, m)
  }
}
