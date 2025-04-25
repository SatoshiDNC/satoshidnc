import { crypt } from '../../../../../cryption.js'
import * as geom from '../geometry.js'

//let debug = false
let flag = false

export function prep_kind30023(view, post) {
  const v = view, p = post, data = p.preloaded.data
  const encryption = data.tags.filter(t => t[0] == 'encryption')?.[0]?.[1] || ''
  const title = data.tags.filter(t => t[0] == 'title')?.[0]?.[1] || ''
  const summary = data.tags.filter(t => t[0] == 'summary')?.[0]?.[1] || ''
  let payload = data.content
  if (encryption == 'cc20s10') {
    let key = data._key && Uint8Array.from(data._key.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
    payload = new TextDecoder().decode(crypt(0, Uint8Array.from(data.content.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))), key).map(v => key? v: v>32 && v<127? v: 63))
  }

  let plaintext = `${title}\n\n${summary}\n\n${payload}`

  // kludge to remove characters that cause NaN measurements
  let i = plaintext.length
  while (i--) {
    let c = plaintext.charAt(i)
    if ((defaultFont.calcWidth(c)||-1234) == -1234 && c!='\n') {
      plaintext = plaintext.replaceAll(c, '')
      i = plaintext.length
    }
  }

  if (flag) {
    debug = true
    let key = Uint8Array.from("0102030405060708090001020304050607080900010203040506070809000102030405060708090001020304".match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
    console.log(key)
    let test = "abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let x = crypt(0, new TextEncoder().encode(test), key)
    let y = crypt(0, x, key)
    flag = false
    debug = false
  }

  const m = mat4.create()
  const ts = geom.TEXT_SCALE

  let lines = []

  const whitespace = false
  const paragraphs = plaintext.trim().replaceAll('\x0a\x0a+', '\x0a\x0a').replaceAll('\x0a\s*\x0a', `${whitespace?'¶':''}\x0a\x0a`).split('\x0a\x0a')
  const max_width = v.sw - geom.SPACE_LEFT - geom.SPACE_RIGHT - geom.TEXT_SPACE_LEFT - geom.TEXT_SPACE_RIGHT

  for (const para of paragraphs) {
    if (debug) console.log(`for (const para ${para} of paragraphs ${paragraphs}) {`)
    if (lines.length == 0) lines.push('')
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
  p.lines = lines // [ lines[0], lines[1], lines[2], lines[3], lines[4], lines[5], lines[6], lines[7], lines[8], lines[9] ]
  p.total_height = geom.TEXT_SPACE_BELOW + geom.TEXT_HEIGHT + (p.lines.length - 1) * geom.TEXT_LINE_SPACING + geom.TEXT_SPACE_ABOVE
  p.type = 'default'
}

