import { crypt } from '../../../../../cryption.js'

let debug = false

export function render_kind30023(view, data) {
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

