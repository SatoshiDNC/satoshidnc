import { getFeed, markUpdateAsViewed } from '../../../../content.js'
import { getHue, getPersonalData, setPersonalData, personalDataTrigger } from '../../../../personal.js'
import { drawRoundedRect, drawRect, drawPill, blend, alpha, setValue } from '../../../../draw.js'
import { prep_kind1 } from './kind/1-short-text-note.js'
import { prep_kind30023, prep_kind30023_preview } from './kind/30023-long-form-note.js'
import * as geom from './geometry.js'
import { kindInfo } from '../../../../nostor-util.js'

const TAG = 'channel'
const DAY_IN_SECONDS = 86400

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
personalDataTrigger.push(() => {
  if (!v.posts) return
  console.log(`[${TAG}] detected personal data change`, v)
  v.previous_width = 0 // to force re-formatting
  v.queueLayout()
})
v.gadgets.push(g = v.screenGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function(pointer) {
    const g = this, v = g.viewport
    let y = 0
    let post, post_y
    let i = 0
    for (const p of v.posts) {
      const py = (pointer.py-v.y)/v.getScale()
      if (v.sh-v.userY-py >= p.y0 && v.sh-v.userY-py <= p.y1) {
        post = p
        post_y = v.sh-v.userY-py - p.y0
        break
      }
      i++
    }
    if (post) {

      // check for gadget click
      if (post.gadgets) {
        post.gadgets.map(g => {
          g.autoHull()
          const touchRadius = 85, clickRadius = 5;
          function getPointerRadius() { return (navigator.maxTouchPoints>0 ? touchRadius : clickRadius); }
          const hitList = { x: pointer.x, y: pointer.y, hits: [] }
          g.getHits(hitList, getPointerRadius())
          if (hitList.hits.map(h => h.gad).includes(g)) {
            if (g.key == 'apply:name') {
              setPersonalData(v.hpub, 'name', g.value)
            }
          }
        })

        // handle the read-more (a bit kludgey)
      } else if (post_y >= post.readmore_baseline && post_y <= post.readmore_baseline+geom.TEXT_HEIGHT) {
        const p = post
        if (p.preloaded.data.kind == 1) {
        } else if (p.preloaded.data.kind == 30023) {
          const pre_h = p.total_height
          prep_kind30023(v, p)
          const new_h = p.total_height
          p.expanded = true
          v.userY -= new_h - pre_h
        } else {
        }
        v.queueLayout()
      }
    }
  }
v.gadgets.push(g = v.swipeGad = new fg.SwipeGadget(v))
  g.actionFlags = fg.GAF_SWIPEABLE_UPDOWN|fg.GAF_SCROLLABLE_UPDOWN
v.setContext = function(updates, hpub) {
  const v = this
  v.hpub = hpub
  v.updates = updates.filter(u => u.hpub == hpub)
  v.startTime = 0
  v.hue = getHue(v.hpub)
  v.bgColor = blend(colors.black, v.hue, TINGE.BACKGROUND)
  v.bubbleColor = setValue(v.bgColor, TINGE.BACKGROUND_BUBBLE)
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
  let prev_date = 0
  for (let i = 0; i < v.posts.length; i++) {
    if (v.posts[i].preloaded.data.id == preloaded.data.id) {
      return
    }
    if (v.posts[i].preloaded.data.created_at < preloaded.data.created_at) {
      v.posts.splice(i, 0, { preloaded })
      return
    }
    prev_date = v.posts[i].preloaded.data.created_at
  }
  v.posts.push({ preloaded })
}
v.layoutFunc = function() {
  const v = this
  v.minX = 0, v.maxX = v.sw
  v.minY = Math.min(0, v.sh-v.posts.reduce((a,p)=>a+geom.SPACE_BELOW+(p.reactions?geom.REACTIONS_HEIGHT-geom.REACTIONS_OVERLAP:0)+(p.total_height?p.total_height:0)+geom.SPACE_ABOVE,0)), v.maxY = v.sh
  let g
  g = v.screenGad
  g.x = 0, g.y = 0
  g.w = v.sw, g.h = v.sh
  g.autoHull()

  if (v.sw != v.previous_width) {
    // remove cached fields to force re-calculation on width change
    const reset_posts = []
    for (const p of v.posts) {
      reset_posts.push({ preloaded: p.preloaded, expanded: p.expanded })
    }
    v.posts = reset_posts
    v.previous_width = v.sw
  }
  v.swipeGad?.layout()
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)

  g = v.screenGad
  g.x = 0, g.y = v.userY
  g.w = v.sw, g.h = v.sh
  g.autoHull()

  let y = 0, last_date = 0
  let previous_content = '{}'
  for (let i = v.posts.length-1; i>=0; i--) {
    const p = v.posts[i]
    const fields_updated = []
    if (!p.type && p.preloaded.data.kind == 0) {
      if (p.preloaded.data.content != previous_content) {
        const old_metadata = JSON.parse(previous_content)
        const new_metadata = JSON.parse(p.preloaded.data.content)
        p.lines = [...format_lines('Profile Update').map(line => `# ${line}`)]
        for (const key of Object.keys(new_metadata)) {
          if (Object.keys(old_metadata).includes(key)) {
            if (old_metadata[key] != new_metadata[key]) {
              if (!fields_updated.includes(key)) { fields_updated.push(key) }
            }
          } else {
            if (!fields_updated.includes(key)) { fields_updated.push(key) }
          }
          // if (Object.keys(old_metadata).includes(key)) {
          //   p.lines.push(`Updated ${key.replace('_',' ')}`)
          // } else {
          //   p.lines.push(`Set ${key.replace('_',' ')}`)
          // }
        }
        for (const key of Object.keys(old_metadata)) {
          if (!Object.keys(new_metadata).includes(key)) {
            if (!fields_updated.includes(key)) { fields_updated.push(key) }
          }
          // if (!Object.keys(new_metadata).includes(key)) {
          //   p.lines.push(`Removed ${key.replace('_',' ')}`)
          // }
        }
        p.keys = []
        for (const remaining of fields_updated) {
          let duplicate = false
          for (const key of p.keys) {
            if (key[1] === new_metadata[remaining]) {
              key[0].push(remaining)
              duplicate = true
            }
          }
          if (!duplicate) {
            p.keys.push([[remaining], new_metadata[remaining]])
          }
        }
        for (const k of p.keys) {
          const key = k[0][0], keyName = k[0].join(' / ')
          const t1 = `${keyName||key}`
          const t2 = `${new_metadata[key]}`
          let t3 = ''
          if (key === 'created_at' && `${new_metadata[key]}` === `${+new_metadata[key]}`) {
            t3 = new Date(new_metadata[key] * 1000).toLocaleString()
          }
          let max_width = undefined
          const apply_name = k[0].includes('name') && getPersonalData(v.hpub, 'name') != t2
          if (apply_name) {
            max_width = v.sw-geom.SPACE_LEFT-geom.TEXT_SPACE_LEFT-200-2*geom.TEXT_SPACE_RIGHT-geom.SPACE_RIGHT
          }
          p.lines.push(...format_lines(t1).map(line => `## ${line}`))
          const temp_lines = format_lines(t2 + (t3? ' | ' + t3: ''), max_width)
          if (apply_name) {
            if (!p.gadgets) { p.gadgets = [] }
            const g = new fg.Gadget(v)
            g.key = 'apply:name'
            g.value = t2
            p.gadgets.push(g)
            temp_lines[0] = `${temp_lines[0]}\0${g.key}`
          }
          p.lines.push(...temp_lines)
        }
        p.total_height = geom.TEXT_SPACE_BELOW + geom.TEXT_HEIGHT + (p.lines.length - 1 - p.lines.filter(l => l=='').length/2) * geom.TEXT_LINE_SPACING + geom.TEXT_SPACE_ABOVE
        p.type = 'metadata'
        previous_content = p.preloaded.data.content
      } else {
        p.lines = [ `Reposted ${kindInfo.filter(r => p.preloaded.data.kind >= r.kind && p.preloaded.data.kind <= (r.kindMax || r.kind))?.[0]?.desc || 'something'} (no changes)` ]
        p.total_height = geom.TEXT_SPACE_BELOW + geom.TEXT_HEIGHT + (p.lines.length - 1) * geom.TEXT_LINE_SPACING + geom.TEXT_SPACE_ABOVE
        p.type = 'notice'
      }
      p.reactions = {'❤':2, '💔':1}
    }
  }
  for (const p of v.posts) {
    if (!p.type) {
      if (p.preloaded.data.kind == 1) {
        prep_kind1(v, p)
      } else if (p.preloaded.data.kind == 30023) {
        if (p.expanded) {
          prep_kind30023(v, p)
        } else {
          prep_kind30023_preview(v, p)
        }
      } else if (p.preloaded.data.kind == 0) {
      } else {
        p.lines = [ `Posted ${kindInfo.filter(r => p.preloaded.data.kind >= r.kind && p.preloaded.data.kind <= (r.kindMax || r.kind))?.[0]?.desc || 'something'}` ]
        p.total_height = geom.TEXT_SPACE_BELOW + geom.TEXT_HEIGHT + (p.lines.length - 1) * geom.TEXT_LINE_SPACING + geom.TEXT_SPACE_ABOVE
        p.type = 'notice'
      }
      p.reactions = {'❤': 1}
    }
    if (v.sh-(v.userY+y + geom.SPACE_BELOW+p.total_height+geom.SPACE_ABOVE) < v.sh && v.sh-(v.userY+y) > 0) {
      y += geom.SPACE_BELOW
      if (p.reactions) {
        y += geom.REACTIONS_HEIGHT-geom.REACTIONS_OVERLAP
      }
      if (p.type == 'notice') {
        v.render_notice(p, y)
      } else if (p.type == 'default') {
        v.render_default(p, y)
      } else if (p.type == 'metadata') {
        v.render_metadata(p, y)
      }
      if (p.reactions) {
        v.render_reactions(p, y + geom.REACTIONS_OVERLAP)
      }
      p.y0 = y
      y += p.total_height
      p.y1 = y
      if (debug) {
        v.render_debug_info(p, y)
        y += geom.TEXT_HEIGHT
      }
      y += geom.SPACE_ABOVE
    } else {
      y += geom.SPACE_BELOW
      if (p.reactions) { y += geom.REACTIONS_HEIGHT-geom.REACTIONS_OVERLAP }
      y += p.total_height
      if (debug) { y += geom.TEXT_HEIGHT }
      y += geom.SPACE_ABOVE
    }
    last_date = Math.floor(p.preloaded.data.created_at/DAY_IN_SECONDS)*DAY_IN_SECONDS
  }
}
v.render_reactions = function(post, y) {
  const v = this, p = post
  drawPill(v, v.bgColor, geom.SPACE_LEFT+geom.REACTIONS_SPACE_LEFT,v.sh-y,200,geom.REACTIONS_HEIGHT)
  drawPill(v, v.bubbleColor, geom.SPACE_LEFT+geom.REACTIONS_SPACE_LEFT+geom.REACTIONS_BORDER,v.sh-y+geom.REACTIONS_BORDER,200-2*geom.REACTIONS_BORDER,geom.REACTIONS_HEIGHT-2*geom.REACTIONS_BORDER)
}
v.render_debug_info = function(post, y) {
  const v = this, p = post
  const m = mat4.create()
  mat4.identity(m)
  mat4.translate(m, m, [geom.SPACE_LEFT+geom.TEXT_SPACE_LEFT, v.sh-y, 0])
  mat4.scale(m, m, [geom.TEXT_SCALE/2, geom.TEXT_SCALE/2, 1])
  defaultFont.draw(0,-2, `kind ${p.preloaded.data.kind}, id ${p.preloaded.data.id}`, v.subtitleColor, v.mat, m)
}
v.render_notice = function(post, y) {
  const v = this, p = post
  const m = mat4.create()
  const textColor2 = blend(v.bubbleColor, v.textColor, TINGE.DIM_TEXT)

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
    defaultFont.draw(0,0, line, textColor2, v.mat, m)
  }
}
v.render_default = function(post, y) {
  const v = this, p = post
  const m = mat4.create()

  drawRoundedRect(v, v.bubbleColor, geom.BUBBLE_RADIUS, geom.SPACE_LEFT,v.sh-y-p.total_height, v.sw-geom.SPACE_LEFT-geom.SPACE_RIGHT,p.total_height)

  let line_offset = p.lines.length * 2 - p.lines.filter(l => l=='').length * 1
  for (const line of p.lines) {
    if (line == '') {
      line_offset -= 1
      continue
    }
    line_offset -= 2
    if (v.sh-v.userY-y-geom.TEXT_SPACE_BELOW-line_offset*geom.TEXT_LINE_SPACING/2+geom.TEXT_HEIGHT < 0) { continue }
    if (v.sh-v.userY-y-geom.TEXT_SPACE_BELOW-line_offset*geom.TEXT_LINE_SPACING/2-geom.TEXT_HEIGHT > v.sh) { continue }
    mat4.identity(m)
    mat4.translate(m, m, [geom.SPACE_LEFT+geom.TEXT_SPACE_LEFT, v.sh-y-geom.TEXT_SPACE_BELOW-line_offset*geom.TEXT_LINE_SPACING/2, 0])
    mat4.scale(m, m, [geom.TEXT_SCALE, geom.TEXT_SCALE, 1])
    if (line == '\0') {
      defaultFont.draw(0,0, 'Read more...', v.hue, v.mat, m)
      p.readmore_baseline = geom.TEXT_SPACE_BELOW+line_offset*geom.TEXT_LINE_SPACING/2
    } else {
      defaultFont.draw(0,0, line, v.textColor, v.mat, m)
    }
  }

  const fc = alpha(v.textColor, 0.75)
  const bc = alpha(v.bubbleColor, 0.75)
  const max_w = v.sw-geom.SPACE_LEFT-geom.TEXT_SPACE_LEFT-geom.TEXT_SPACE_RIGHT-geom.SPACE_RIGHT
  const max_h = (p.lines.length - p.lines.filter(l => l=='').length/2) * geom.TEXT_LINE_SPACING + (geom.TEXT_HEIGHT-geom.TEXT_LINE_SPACING)
  const top_overflow = -v.sh+(v.userY+y+geom.TEXT_SPACE_BELOW+max_h)
  if (top_overflow > 0) {
    const w = max_w / max_h * top_overflow
    if (w < max_w) {
      drawRect(v, fc, geom.SPACE_LEFT+geom.TEXT_SPACE_LEFT,v.userY, w,2*geom.TEXT_SCALE)
      drawRect(v, bc, geom.SPACE_LEFT+geom.TEXT_SPACE_LEFT+w,v.userY, max_w-w,2*geom.TEXT_SCALE)
    }
  } else {
    if (p.expanded) {
      p.top_seen = true
      try_send_reaction(p)
    }
  }
  const bottom_overflow = -(v.userY+y+geom.TEXT_SPACE_BELOW)
  if (bottom_overflow > 0) {
    const w = max_w / max_h * bottom_overflow
    if (w < max_w) {
      drawRect(v, fc, v.sw-geom.SPACE_RIGHT-geom.TEXT_SPACE_RIGHT-w,v.userY+v.sh-2*geom.TEXT_SCALE, w,2*geom.TEXT_SCALE)
      drawRect(v, bc, geom.SPACE_LEFT+geom.TEXT_SPACE_LEFT,v.userY+v.sh-2*geom.TEXT_SCALE, max_w-w,2*geom.TEXT_SCALE)
    }
  } else {
    if (p.expanded) {
      p.bottom_seen = true
      try_send_reaction(p)
    }
  }
  if (!p.expanded) {
    p.top_seen = false
    p.bottom_seen = false
  }
}

v.render_metadata = function(post, y) {
  const v = this, p = post
  const m = mat4.create()
  const textColor2 = blend(v.bubbleColor, v.textColor, TINGE.DIM_TEXT)

  // bubble
  drawRoundedRect(v, v.bubbleColor, geom.BUBBLE_RADIUS, geom.SPACE_LEFT,v.sh-y-p.total_height, v.sw-geom.SPACE_LEFT-geom.SPACE_RIGHT,p.total_height)

  // content
  let line_offset = p.lines.length * 2 - p.lines.filter(l => l=='').length * 1
  for (let line of p.lines) {
    if (line == '') {
      line_offset -= 1
      continue
    }
    line_offset -= 2
    if (v.sh-v.userY-y-geom.TEXT_SPACE_BELOW-line_offset*geom.TEXT_LINE_SPACING/2+geom.TEXT_HEIGHT < 0) { continue }
    if (v.sh-v.userY-y-geom.TEXT_SPACE_BELOW-line_offset*geom.TEXT_LINE_SPACING/2-geom.TEXT_HEIGHT > v.sh) { continue }
    mat4.identity(m)
    mat4.translate(m, m, [geom.SPACE_LEFT+geom.TEXT_SPACE_LEFT, v.sh-y-geom.TEXT_SPACE_BELOW-line_offset*geom.TEXT_LINE_SPACING/2, 0])
    mat4.scale(m, m, [geom.TEXT_SCALE, geom.TEXT_SCALE, 1])
    if (line == '\0') {
      defaultFont.draw(0,0, 'Read more...', v.hue, v.mat, m)
      p.readmore_baseline = geom.TEXT_SPACE_BELOW+line_offset*geom.TEXT_LINE_SPACING/2
    } else {
      const cols = line.split('\0')
      line = cols[0]
      if (line.startsWith('# ')) {
        const str = line.substring(2)
        const w = defaultFont.calcWidth(str)
        mat4.translate(m, m, [(v.sw/2-geom.SPACE_LEFT-geom.TEXT_SPACE_LEFT)/geom.TEXT_SCALE, 0, 0])
        defaultFont.draw(-w/2,0, str, textColor2, v.mat, m)
      } else if (line.startsWith('## ')) {
        const str = line.substring(3)
        mat4.scale(m, m, [0.75, 0.75, 1])
        defaultFont.draw(0,0, str, textColor2, v.mat, m)
      } else {
        defaultFont.draw(0,0, line, v.textColor, v.mat, m)
        if (cols.length > 1) {
          const key = cols[1]
          const g = p.gadgets.filter(g => g.key == key)?.[0]
          if (g) {
            const w = 200
            const ts = 29/14
            const str = 'Apply'
            const tw = defaultFont.calcWidth(str)*ts
            g.x = v.sw-geom.SPACE_RIGHT-geom.TEXT_SPACE_RIGHT-w
            g.y = v.sh-y-geom.TEXT_SPACE_BELOW-line_offset*geom.TEXT_LINE_SPACING/2-55
            g.w = w
            g.h = 83
            drawPill(v, blend(v.bubbleColor, v.hue, TINGE.ACTION_BUTTON), g.x,g.y, g.w,g.h)
            mat4.identity(m)
            mat4.translate(m, m, [g.x+(w-tw)/2, g.y+55, 0])
            mat4.scale(m, m, [ts, ts, 1])
            defaultFont.draw(0,0, str, blend(v.textColor, v.hue, TINGE.ACTION_BUTTON), v.mat, m)
          }
        }
      }
    }
  }

  const fc = alpha(v.textColor, 0.75)
  const bc = alpha(v.bubbleColor, 0.75)
  const max_w = v.sw-geom.SPACE_LEFT-geom.TEXT_SPACE_LEFT-geom.TEXT_SPACE_RIGHT-geom.SPACE_RIGHT
  const max_h = (p.lines.length - p.lines.filter(l => l=='').length/2) * geom.TEXT_LINE_SPACING + (geom.TEXT_HEIGHT-geom.TEXT_LINE_SPACING)
  const top_overflow = -v.sh+(v.userY+y+geom.TEXT_SPACE_BELOW+max_h)
  if (top_overflow > 0) {
    const w = max_w / max_h * top_overflow
    if (w < max_w) {
      drawRect(v, fc, geom.SPACE_LEFT+geom.TEXT_SPACE_LEFT,v.userY, w,2*geom.TEXT_SCALE)
      drawRect(v, bc, geom.SPACE_LEFT+geom.TEXT_SPACE_LEFT+w,v.userY, max_w-w,2*geom.TEXT_SCALE)
    }
  } else {
    if (p.expanded) {
      p.top_seen = true
      try_send_reaction(p)
    }
  }
  const bottom_overflow = -(v.userY+y+geom.TEXT_SPACE_BELOW)
  if (bottom_overflow > 0) {
    const w = max_w / max_h * bottom_overflow
    if (w < max_w) {
      drawRect(v, fc, v.sw-geom.SPACE_RIGHT-geom.TEXT_SPACE_RIGHT-w,v.userY+v.sh-2*geom.TEXT_SCALE, w,2*geom.TEXT_SCALE)
      drawRect(v, bc, geom.SPACE_LEFT+geom.TEXT_SPACE_LEFT,v.userY+v.sh-2*geom.TEXT_SCALE, max_w-w,2*geom.TEXT_SCALE)
    }
  } else {
    if (p.expanded) {
      p.bottom_seen = true
      try_send_reaction(p)
    }
  }
  if (!p.expanded) {
    p.top_seen = false
    p.bottom_seen = false
  }
}

export function try_send_reaction(post) {
  const p = post
  if (p.reacted) return
  if (!p.top_seen || !p.bottom_seen) return
  p.reacted = true
  markUpdateAsViewed(p.preloaded.data.id, p.preloaded.data.pubkey, p.preloaded.data.created_at * 1000)

  // console.log(pending_reactions)
  // console.log(pending_reactions.filter(e => e.tags.filter(t => t[0] == 'e' && t[1] == p.preloaded.data.id).length > 0)?.[0])
}

export function format_lines(plaintext, width = undefined) {
  const lines = []
  const ts = geom.TEXT_SCALE
  const whitespace = false
  const paragraphs = plaintext.trim().replaceAll('\x0a\s*\x0a+', '\x0a\x0a').replaceAll('\x0a\x0a', `${whitespace?'¶':''}\x0a\x0a`).split('\x0a\x0a')
  const max_width = width || (v.sw - geom.SPACE_LEFT - geom.SPACE_RIGHT - geom.TEXT_SPACE_LEFT - geom.TEXT_SPACE_RIGHT)
  for (const para of paragraphs) {
    if (debug) console.log(`for (const para ${para} of paragraphs ${paragraphs}) {`)
    if (lines.length != 0) lines.push('')
    const subpars = para.replaceAll('\x0a', `${whitespace?'↵':''}\x0a`).split('\x0a')
    for (const subpar of subpars) {
      if (debug) console.log(`for (const subpar ${subpar} of subpars ${subpars}) {`)
      const words = subpar.split(' ')
      if (debug) console.log(`while (words.length ${words.length} > 0) {`)
      while (words.length > 0) {
        lines.push(words.shift())
        if (debug) console.log(`while (lines[lines.length-1] ${lines[lines.length-1]} && defaultFont.calcWidth(lines[lines.length-1]) ${defaultFont.calcWidth(lines[lines.length-1])} * ts ${ts} >= v.sw ${v.sw}) {`)
        while (lines[lines.length-1] && (defaultFont.calcWidth(lines[lines.length-1])||max_width/ts+1) * ts >= max_width) {
          let l = lines.pop()
          let i = 1, fit = 1
          while ((defaultFont.calcWidth(l.substring(0,i))||max_width/ts+1) * ts <= max_width) {
            fit = i
            i += 1
          }
          lines.push(l.substring(0, fit))
          lines.push(l.substring(fit))
        }
        if (debug) console.log(`while (words.length ${words.length} > 0 && defaultFont.calcWidth(lines[lines.length-1] + ' ' + words[0]) ${defaultFont.calcWidth(lines[lines.length-1] + ' ' + words[0])} * ts ${ts} <= v.sw ${v.sw}) {`)
        while (words.length > 0 && (defaultFont.calcWidth(lines[lines.length-1] + ' ' + words[0])||max_width/ts+1) * ts <= max_width) {
          lines.push(lines.pop() + ' ' + words.shift())
        }
      }
    }
  }
  return lines
}