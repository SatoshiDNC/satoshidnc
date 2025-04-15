import { crypt } from '../../../../../cryption.js'

let debug = false

export function render_kind1(view, data) {
  const v = view
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

  if (json) {
    render_kind1_json(v, data, json)
  } else {
    render_kind1_plaintext(v, plaintext)
  }
}

export function render_kind1_plaintext(view, plaintext) {
  const v = view
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

export function render_kind1_json(view, data, json) {
  const v = view
  const m = mat4.create()

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

  let max_text_height = 128
  let usable_height = v.sh - 400
  let rowHeight = Math.min(usable_height / keys.length, max_text_height * 3/8 + max_text_height * 3/2)
  let textHeight = rowHeight * 8/15
  let y = 200 + (usable_height - rowHeight * keys.length)/2
  const displayStandardLine = (key, keyName, value) => {
    const t1 = `${keyName||key}:`
    const t2 = `${value}`
    const name_color = blend(colors.title, v.bgColor, 0.5)
    let t3 = ''
    if (key === 'created_at' && `${value}` === `${+value}`) {
      t3 = new Date(value * 1000).toLocaleString()
    }
    let ts = textHeight/14 * 0.5
    let tw = defaultFont.calcWidth(t1)
    if (tw * ts > v.sw - 30) {
      ts = (v.sw - 30) / tw
    }
    mat4.identity(m)
    mat4.translate(m, m, [15, g.y + y + textHeight * 0.5, 0])
    mat4.scale(m, m, [ts, ts, 1])
    defaultFont.draw(0,0, t1, name_color, v.mat, m)
    ts = textHeight/14
    tw = defaultFont.calcWidth(t2 + (t3?' | ' + t3:''))
    if (tw * ts > v.sw - 30) {
      ts = (v.sw - 30) / tw
    }
    mat4.identity(m)
    mat4.translate(m, m, [15, g.y + y + textHeight * 0.5 + ts*14 + textHeight * 2/16, 0])
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
