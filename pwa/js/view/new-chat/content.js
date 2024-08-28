import { barTop as topBar } from './bar-top.js'
import { hpub, npub } from '../../key.js'
import { setEasingParameters } from '../util.js'

let v, g
export const newChatView = v = new fg.View(null)
v.name = Object.keys({newChatView}).pop()
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.subtitleColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
v.buttonFaceColor = colors.accentButtonFace
v.buttonTextColor = colors.accentButtonText
v.gadgets.push(g = v.scanGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '\x08'
  g.clickFunc = function() {
    const g = this, v = this.viewport
    //g.root.easeOut(g.target)
    console.log('scanGad click')
  }
v.layoutFunc = function() {
  const v = this
  let g
  g = v.scanGad
  g.x = v.sw - 220, g.y = 308
  g.w = 47, g.h = 47
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)  
  const m = mat4.create()
  const mat = mat4.create()

  const contacts = [
    { pubkey: hpub(), name: 'You', xmitDate: new Date(), xmitText: 'link' },
    { pubkey: hpub(), name: npub(), xmitDate: new Date(), xmitText: 'You reacted "&" to "Ok, thanks for the help!"' },
  ]

  const iconRender = (icon, x, y, ix, iy, iw) => {
    const size = 105
    mat4.identity(m)
    mat4.translate(m,m, [x, y + size, 0])
    mat4.scale(m,m, [size/6, size/6, 1])
    iconFont.draw(0,0, `\x0d`, v.buttonFaceColor, v.mat, m)
    mat4.identity(m)
    mat4.translate(m,m, [ix, iy, 0])
    mat4.scale(m,m, [iw/iconFont.calcWidth(icon), iw/iconFont.calcWidth(icon), 1])
    iconFont.draw(0,0, icon, v.buttonTextColor, v.mat, m)
  }
  const npubRender = (c, x, y) => {
    mat4.identity(mat)
    mat4.translate(mat, mat, [x, y, 0])
    mat4.scale(mat, mat, [127/32, 127/32, 1])
    let ox = -0.5, oy = 8.5
    c.pubkey.toUpperCase().match(/.{1,16}/g).map((str, i) => {
      mat4.copy(m, mat)
      nybbleFont.draw(ox,oy + i*8, str, v.titleColor, v.mat, m)
    })  
  }
  const dateRender = (c, x, y) => {
    mat4.identity(m)
    mat4.translate(m,m, [x,y, 0])
    const s2 = 25/14
    mat4.scale(m,m, [s2, s2, 1])
    const str = c.xmitDate.toLocaleTimeString(undefined, { hour12: true, hourCycle: 'h11', hour: 'numeric', minute: 'numeric' })
    const w1 = defaultFont.calcWidth(str)
    defaultFont.draw(-w1,0, str, v.subtitleColor, v.mat, m)
    return { text: str, width: w1, scale: s2 }
  }
  const titleRender = (c, x, y, w1, s2) => {
    mat4.identity(m)
    mat4.translate(m,m, [x, y, 0])
    const s1 = 35/14
    mat4.scale(m,m, [s1, s1, 1])
    const w3 = v.sw - 192 - 45 - 25 - w1 * s2
    let str
    if (defaultFont.calcWidth(c.name) * s1 > w3) {
      let l = c.name.length
      while (defaultFont.calcWidth(c.name.substring(0,l)+'...') * s1 > w3) {
        l--
      }
      str = c.name.substring(0,l)+'...'
    } else {
      str = c.name
    }
    defaultFont.draw(0,0, str, v.titleColor, v.mat, m)
  }
  const subtitleRender = (c, x, y) => {
    mat4.identity(m)
    mat4.translate(m,m, [x, y, 0])
    const s3 = 31/14
    mat4.scale(m,m, [s3, s3, 1])
    const w4 = v.sw - 192 - 45 - 25
    let str
    if (defaultFont.calcWidth(c.xmitText) * s3 > w4) {
      let l = c.xmitText.length
      while (defaultFont.calcWidth(c.xmitText.substring(0,l)+'...') * s3 > w4) {
        l--
      }
      str = c.xmitText.substring(0,l)+'...'
    } else {
      str = c.xmitText
    }
    defaultFont.draw(0,0, str, v.subtitleColor, v.mat, m)
  }

  let c = { name: 'New group' }
  let i = 0
  iconRender('\x02', 42, 53 + 179 * i, 63, 127 + 179 * i, 63)
  titleRender(c, 192, 124 + 179 * i, 0, 1)
  i++

  c = { name: 'New contact' }
  iconRender('\x01', 42, 53 + 179 * i, 63, 127 + 179 * i, 63)
  titleRender(c, 192, 124 + 179 * i, 0, 1)
  let g = v.scanGad
  mat4.identity(m)
  mat4.translate(m,m, [g.x, g.y, 0])
  let s = g.w/iconFont.calcWidth(g.label)
  mat4.scale(m,m, [s, s, 1])
  iconFont.draw(0,0, g.label, v.titleColor, v.mat, m)
  i++

  c = { name: 'New community' }
  iconRender('\x03', 42, 53 + 179 * i, 63, 127 + 179 * i, 63)
  titleRender(c, 192, 124 + 179 * i, 0, 1)
  i++

  let x = 44, y = 617
  mat4.identity(m)
  mat4.translate(m,m, [x, y, 0])
  const s3 = 29/14
  mat4.scale(m,m, [s3, s3, 1])
  defaultFont.draw(0,0, 'Contacts on Nostr', v.subtitleColor, v.mat, m)

  i = 0
  for (const c of contacts) {
    npubRender(c, 31, 686 + 200 * i) // 482
    const { text: str, width: w1, scale: s2 } = dateRender(c, v.sw - 45, 729 + 200 * i)
    titleRender(c, 192, 735 + 200 * i, w1, s2)
    subtitleRender(c, 195, 800 + 200 * i)
    i++
  }

  // item spacing: 200
  // photo x=31, w=127, h=127
}
