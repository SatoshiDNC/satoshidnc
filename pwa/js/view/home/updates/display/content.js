import { overlayView } from './overlay.js'
import { markUpdateAsViewed } from '../../../../content.js'
import { blend } from '../../../../draw.js'
import { crypt } from '../../../../cryption.js'

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
v.renderKind1 = function(data) {
  const v = this
  const hexColor = data.tags.filter(t => t[0] == 'bgcolor')?.[0]?.[1] || data.id[61] + data.id[61] + data.id[62] + data.id[62] + data.id[63] + data.id[63]
  const rgbColor = parseInt(hexColor,16)
  const bgColor = [((~~(rgbColor/0x10000))&0xff)/0xff, ((~~(rgbColor/0x100))&0xff)/0xff, ((~~(rgbColor/0x1))&0xff)/0xff, 1]
  const encryption = data.tags.filter(t => t[0] == 'encryption')?.[0]?.[1] || ''
  v.bgColor = bgColor
  gl.clearColor(...bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  let plaintext = data.content
  if (encryption == 'cc20s10') {
    let key = data._key && Uint8Array.from(data._key.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
    plaintext = new TextDecoder().decode(crypt(0, Uint8Array.from(data.content.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))), key).map(v => key? v: v>32 && v<127? v: 63))
  }

  let json = v.last_json
  if (data !== v.lastData) {
    v.lastData = data
    try {
      json = JSON.parse(plaintext)
    } catch {
      json = undefined
    }
    v.last_json = json
  }
  console.log(json)

  if (json) {
    v.render_kind1_json(data, json)
  } else {
    v.render_kind1_plaintext(plaintext)
  }

}

v.render_kind1_plaintext = function(plaintext) {
  const v = this
  const m = mat4.create()
  const whitespace = false
  let t,tw,th,ts
  ts = 50/14
  const paragraphs = plaintext.replaceAll('\x0a', `${whitespace?'¶':''}\x0a`).split('\x0a')
  //const paragraphs = ['A😊B']
  if (debug) paragraphs.pop()
  if (debug) paragraphs.push('This is a test of the emergency broadcasting system. This is only a test.')
  const lines = []
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
  debug = false
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

v.render_kind1_json = function(data, json) {
  const v = this
  const m = mat4.create()
  const textHeight = 128
  const rowHeight = textHeight * 3/8 + textHeight * 3/2

  let keys = []
  for (const remaining of Object.keys(json)) {
    let duplicate = false
    for (const key of keys) {
      if (key[1] === json[remaining]) {
        key[0].push(remaining)
        duplicate = true
      }
    }
    if (!duplicate) {
      keys.push([[remaining], json[remaining]])
    }
  }

  let y = 200
  const displayStandardLine = (key, keyName, value) => {
    const t1 = `${keyName||key}:`
    const t2 = `${value}`
    const name_color = blend(colors.title, v.bgColor, 0.5)
    let t3 = ''
    if (key === 'created_at' && `${value}` === `${+value}`) {
      t3 = new Date(value * 1000).toLocaleString()
    }
    let ts = textHeight/14 * 0.5
    mat4.identity(m)
    mat4.translate(m, m, [15, g.y + y + textHeight * 0.5, 0])
    mat4.scale(m, m, [ts, ts, 1])
    defaultFont.draw(0,0, t1, name_color, v.mat, m)
    ts = textHeight/14
    mat4.identity(m)
    mat4.translate(m, m, [15, g.y + y + textHeight * 1.5 + textHeight * 2/16, 0])
    mat4.scale(m, m, [ts, ts, 1])
    defaultFont.draw(0,0, t2, colors.title, v.mat, m)
    if (t3) {
      defaultFont.draw(0,0, ' | ', name_color, v.mat, m)
      defaultFont.draw(0,0, t3, colors.title, v.mat, m)
    }
    y += rowHeight
  }

  for (const key of keys) {
    displayStandardLine(key[0][0], key[0].join(' / '), key[1])
  }

}

v.renderDefault = function(data) {
  const v = this
  const hexColor = data.tags?.filter(t => t[0] == 'bgcolor')?.[0]?.[1] || data.id[61] + data.id[61] + data.id[62] + data.id[62] + data.id[63] + data.id[63]
  const rgbColor = parseInt(hexColor,16)
  const bgColor = [((~~(rgbColor/0x10000))&0xff)/0xff, ((~~(rgbColor/0x100))&0xff)/0xff, ((~~(rgbColor/0x1))&0xff)/0xff, 1]
  const encryption = data.tags?.filter(t => t[0] == 'encryption')?.[0]?.[1] || ''
  v.bgColor = blend(bgColor, [0,0,0,1], 0.25)
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