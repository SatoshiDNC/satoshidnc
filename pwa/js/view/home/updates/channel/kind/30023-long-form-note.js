import { crypt } from '../../../../../cryption.js'
import * as geom from '../geometry.js'

let debug = false

export function prep_kind30023(view, post) {
  const v = view, p = post
  const encryption = p.preloaded.data.tags.filter(t => t[0] == 'encryption')?.[0]?.[1] || ''
  let plaintext = p.preloaded.data.tags.filter(t => t[0] == 'summary')[0][1]
  // if (encryption == 'cc20s10') {
  //   let key = data._key && Uint8Array.from(data._key.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
  //   plaintext = new TextDecoder().decode(crypt(0, Uint8Array.from(data.content.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))), key).map(v => key? v: v>32 && v<127? v: 63))
  // }

  const m = mat4.create()
  const ts = geom.TEXT_SCALE

  let lines = []

  const whitespace = false
  const paragraphs = plaintext.replaceAll('\x0a', `${whitespace?'¶':''}\x0a`).split('\x0a')
  const max_width = v.sw - geom.SPACE_LEFT - geom.SPACE_RIGHT - geom.TEXT_SPACE_LEFT - geom.TEXT_SPACE_RIGHT

  for (const para of paragraphs) {
    if (debug) console.log(`for (const para ${para} of paragraphs ${paragraphs}) {`)
    const words = para.split(' ')
    if (debug) console.log(`while (words.length ${words.length} > 0) {`)
    while (words.length > 0) {
      lines.push(words.shift())
      if (debug) console.log(`while (lines[lines.length-1] ${lines[lines.length-1]} && defaultFont.calcWidth(lines[lines.length-1]) ${defaultFont.calcWidth(lines[lines.length-1])} * ts ${ts} >= v.sw ${v.sw}) {`)
      while (lines[lines.length-1] && defaultFont.calcWidth(lines[lines.length-1]) * ts >= max_width) {
        let l = lines.pop()
        let i = 1, fit = 1
        while (defaultFont.calcWidth(l.substring(0,i)) * ts <= max_width) {
          fit = i
          i += 1
        }
        lines.push(l.substring(0, fit))
        lines.push(l.substring(fit))


        // let buf = ''
        // if (debug) console.log(`while (lines[lines.length-1] ${lines[lines.length-1]} && defaultFont.calcWidth(lines[lines.length-1]) ${defaultFont.calcWidth(lines[lines.length-1])} * ts ${ts} >= v.sw ${v.sw}) {`)
        // while (lines[lines.length-1] && defaultFont.calcWidth(lines[lines.length-1]) * ts >= max_width) {
        //   let l = lines.pop()
        //   buf = l.substring(l.length-1) + buf
        //   l = l.substring(0, l.length-1)
        //   lines.push(l)
        // }
        // lines.push(buf)
      }
      if (debug) console.log(`while (words.length ${words.length} > 0 && defaultFont.calcWidth(lines[lines.length-1] + ' ' + words[0]) ${defaultFont.calcWidth(lines[lines.length-1] + ' ' + words[0])} * ts ${ts} <= v.sw ${v.sw}) {`)
      while (words.length > 0 && defaultFont.calcWidth(lines[lines.length-1] + ' ' + words[0]) * ts <= max_width) {
        lines.push(lines.pop() + ' ' + words.shift())
      }
    }
  }
  p.lines = lines
  p.total_height = geom.TEXT_SPACE_BELOW + geom.TEXT_HEIGHT + (p.lines.length - 1) * geom.TEXT_LINE_SPACING + geom.TEXT_SPACE_ABOVE
  p.type = 'default'
}

