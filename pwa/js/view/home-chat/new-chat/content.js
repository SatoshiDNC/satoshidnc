import { contacts, contactViewDependencies } from '../../../contacts.js'
import { keys, keyViewDependencies } from '../../../keys.js'
import { getPersonalData as getAttr, personalData, personalDataViewDependencies } from '../../../personal.js'
import { contentView as chatRoomView } from '../../chat-room/content.js'

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.subtitleColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
v.buttonFaceColor = colors.accentButtonFace
v.buttonTextColor = colors.accentButtonText
v.gadgets.push(g = v.newGroupGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = 'New group'
  g.x = 0, g.y = 16 + 179 * 0, g.h = 179
  g.clickFunc = function() {
    const g = this, v = this.viewport
    //g.root.easeOut(g.target)
    console.log('newGroupGad click')
  }
v.gadgets.push(g = v.newContactGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = 'New contact'
  g.x = 0, g.y = 16 + 179 * 1, g.h = 179
  g.clickFunc = function() {
    const g = this, v = this.viewport
    g.root.easeOut(g.target)
  }
v.gadgets.push(g = v.newCommunityGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = 'New community'
  g.x = 0, g.y = 16 + 179 * 2, g.h = 179
  g.clickFunc = function() {
    const g = this, v = this.viewport
    //g.root.easeOut(g.target)
    console.log('newCommunityGad click')
  }
v.gadgets.push(g = v.scanGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '\x04'
  g.z = 1
  g.clickFunc = function() {
    const g = this, v = this.viewport
    //g.root.easeOut(g.target)
    console.log('scanGad click')
  }
v.gadgets.push(g = v.listGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    const x = (e.x - v.x) / v.viewScale - v.x, y = (e.y - v.y) / v.viewScale
    const index = Math.floor((y - 649) / 179)
    const hpub = g.itemList?.[index]
    if (hpub) {
      chatRoomView.setContact(hpub)
      g.root.easeOut(g.target)
    }
  }
v.layoutFunc = function() {
  const v = this
  let g
  g = v.newGroupGad, g.w = v.sw, g.autoHull()
  g = v.newContactGad, g.w = v.sw, g.autoHull()
  g = v.newCommunityGad, g.w = v.sw, g.autoHull()
  g = v.scanGad
  g.x = v.sw - 220, g.y = 261
  g.w = 47, g.h = 47
  g.autoHull()
  g = v.listGad
  g.x = 0, g.y = 0
  g.w = v.sw, g.h = v.sh
  g.autoHull()
}
contactViewDependencies.push(v)
keyViewDependencies.push(v)
personalDataViewDependencies.push(v)
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)  
  const m = mat4.create()
  const mat = mat4.create()

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
    mat4.scale(mat, mat, [105/32, 105/32, 1])
    let ox = -0.5, oy = 8.5
    c.hpub.toUpperCase().match(/.{1,16}/g).map((str, i) => {
      mat4.copy(m, mat)
      nybbleFont.draw(ox,oy + i*8, str, v.titleColor, v.mat, m)
    })  
  }
  const titleRender = (c, x, y) => {
    mat4.identity(m)
    mat4.translate(m,m, [x, y + (c.about? 29:0), 0])
    const s1 = 35/14
    mat4.scale(m,m, [s1, s1, 1])
    const w3 = v.sw - 192 - 45 - 25
    const title = c.title
    let str
    if (defaultFont.calcWidth(title) * s1 > w3) {
      let l = title.length
      while (defaultFont.calcWidth(title.substring(0,l)+'...') * s1 > w3) {
        l--
      }
      str = title.substring(0,l)+'...'
    } else {
      str = title
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
    if (defaultFont.calcWidth(c.about) * s3 > w4) {
      let l = c.about.length
      while (defaultFont.calcWidth(c.about.substring(0,l)+'...') * s3 > w4) {
        l--
      }
      str = c.about.substring(0,l)+'...'
    } else {
      str = c.about
    }
    defaultFont.draw(0,0, str, v.subtitleColor, v.mat, m)
  }

  let i = 0
  let g
  g = v.newGroupGad
  iconRender('\x02', 42, 53 + 179 * i, 63, 127 + 179 * i, 63)
  titleRender(g.label, 192, 124 + 179 * i, 0, 1)
  i++

  g = v.newContactGad
  iconRender('\x01', 42, 53 + 179 * i, 63, 127 + 179 * i, 63)
  titleRender(g.label, 192, 124 + 179 * i, 0, 1)

  g = v.scanGad
  mat4.identity(m)
  mat4.translate(m,m, [g.x, g.y + g.h, 0])
  let s = g.w/iconFont.calcWidth(g.label)
  mat4.scale(m,m, [s, s, 1])
  iconFont.draw(0,0, g.label, v.titleColor, v.mat, m)
  i++

  g = v.newCommunityGad
  iconRender('\x03', 42, 53 + 179 * i, 63, 127 + 179 * i, 63)
  titleRender(g.label, 192, 124 + 179 * i, 0, 1)
  i++

  let x = 44, y = 617
  mat4.identity(m)
  mat4.translate(m,m, [x, y, 0])
  const s3 = 29/14
  mat4.scale(m,m, [s3, s3, 1])
  defaultFont.draw(0,0, 'Contacts on Nostor', v.subtitleColor, v.mat, m)

  i = 0
  const index = []
  for (const c of [ ...keys.map(k => { return {
    hpub: k.hpub,
    name: (getAttr(k.hpub, 'name') || 'Unnamed') + ' (You)',
    about: 'Message yourself',
  }}), ...contacts.map(c => { return {
    hpub: c.hpub,
    name: getAttr(c.hpub, 'name'),
    about: getAttr(c.hpub, 'about') || '',
  }}) ]) {
    index.push(c.hpub)
    npubRender(c, 42, 686 + 179 * i) // 482
    titleRender(c.name, 190, 728 + 179 * i)
    subtitleRender(c, 192, 788 + 179 * i)
    i++
  }
  v.listGad.itemList = index
}
