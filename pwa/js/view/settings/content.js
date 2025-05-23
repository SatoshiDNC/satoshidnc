import { device, contacts, contactDependencies } from '../../contacts.js'
import { drawPill } from '../../draw.js'
import { contentView as chatRoomView } from '../chat-room/content.js'
import { defaultKey } from '../../keys.js'
import { getName, getPersonalData } from '../../personal.js'
import { rootView as storageView } from './storage/root.js'

let v, g
const m = mat4.create()
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.splashMode = 0
v.frameTimes = []
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.subtitleColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
v.gadgets.push(g = v.addGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '*'
  g.color = colors.accent
  g.font = iconFont
  g.fontSize = 18
  g.y = 100
  g.w = 53, g.h = 53
  g.clickFunc = function() {
    const g = this, v = this.viewport
    console.log(`click '${g.label}'`)
  }
v.gadgets.push(g = v.scanGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '\x04'
  g.color = colors.accent
  g.font = iconFont
  g.fontSize = 18
  g.y = 103
  g.w = 47, g.h = 47
  g.clickFunc = function() {
    const g = this, v = this.viewport
    console.log(`click 'scan'`)
  }
v.gadgets.push(g = v.profileGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 0, g.y = 0
  g.h = 265
  g.clickFunc = function() {
    const g = this, v = this.viewport
    g.root.easeOut(g.target)
  }
const settingsPages = [
  { title: 'Account', subtitle: 'Security notifications, change number' },
  { title: 'Privacy', subtitle: 'Block contacts, disappearing messages' },
  { title: 'Avatar', subtitle: 'Create, edit, profile photo' },
  { title: 'Favorites', subtitle: 'Add, reorder, remove' },
  { title: 'Chats', subtitle: 'Theme, wallpapers, chat history' },
  { title: 'Notifications', subtitle: 'Message, group & call tones' },
  { title: 'Storage and data', subtitle: 'Network usage, auto-download', target: storageView },
  { title: 'App language', subtitle: 'English (device’s language)' },
  { title: 'Help', subtitle: 'Help center, contact us, privacy policy' },
  { title: 'Invite a friend' },
]
let i = 0
for (const p of settingsPages) {
  v.gadgets.push(g = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.class = 'settings'
  g.x = 0, g.y = v.profileGad.h + 12 + 210*i
  g.h = 210
  g.title = p.title
  g.subtitle = p.subtitle
  g.target = p.target
  if (g.target) {
    g.target.a.backGad.root = g.target
    g.target.a.backGad.getTarget = () => v.parent
  }
  g.clickFunc = function() {
    const g = this, v = g.viewport
    console.log('click:', g.title)
    if (g.target) {
      v.parent.easeOut(g.target)
    }
  }
  g.renderFunc = function() {
    const g = this, v = g.viewport
    const offset = 22 // title's vertical shift depending on subtitle presence
    const subtitleMissing = g.subtitle? 0: 1
    let t

    mat4.identity(m)
    mat4.translate(m,m, [g.x + 190, g.y + 90 + offset*subtitleMissing, 0])
    const s1 = 33/14
    mat4.scale(m,m, [s1, s1, 1])
    const w3 = v.sw - 190 - 65
    if (defaultFont.calcWidth(g.title) * s1 > w3) {
      let l = g.title.length
      while (defaultFont.calcWidth(g.title.substring(0,l)+'...') * s1 > w3) {
        l--
      }
      t = g.title.substring(0,l)+'...'
    } else {
      t = g.title
    }
    defaultFont.draw(0,0, t, v.titleColor, v.mat, m)

    if (!subtitleMissing) {
      mat4.identity(m)
      mat4.translate(m,m, [g.x + 190, g.y + 156, 0])
      const s3 = 29/14
      mat4.scale(m,m, [s3, s3, 1])
      const w4 = v.sw - 190 - 65
      if (defaultFont.calcWidth(g.subtitle) * s3 > w4) {
        let l = g.subtitle.length
        while (defaultFont.calcWidth(g.subtitle.substring(0,l)+'...') * s3 > w4) {
          l--
        }
        t = g.subtitle.substring(0,l)+'...'
      } else {
        t = g.subtitle
      }
      defaultFont.draw(0,0, t, v.subtitleColor, v.mat, m)
    }
  }
  i++
}
v.gadgets.push(g = v.swipeGad = new fg.SwipeGadget(v))
  g.actionFlags = fg.GAF_SWIPEABLE_UPDOWN|fg.GAF_SCROLLABLE_UPDOWN
v.layoutFunc = function() {
  const v = this
  v.minX = 0, v.maxX = v.sw
  v.minY = 0 //, v.maxY = v.sh*2
  let g
  g = v.addGad
  g.x = v.sw - 105
  g.autoHull()
  g = v.scanGad
  g.x = v.sw - 202
  g.autoHull()
  g = v.profileGad
  g.w = v.sw
  g.autoHull()
  let max = 0
  for (const g of v.gadgets) {
    if (g.class == 'settings') {
      g.w = v.sw
      g.autoHull()
      max = Math.max(max, g.y+g.h)
    }
  }
  v.maxY = max
  g = v.swipeGad
  g.layout.call(g)
}
contactDependencies.push(() => v.setRenderFlag(true))
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)  
  const m = mat4.create()
  const mat = mat4.create()
  let c = {
    hpub: defaultKey,
    name: getName(defaultKey),
    about: getPersonalData(defaultKey, 'about') || 'I’m using Nostor!',
  }
  let str

  mat4.identity(mat)
  mat4.translate(mat, mat, [42, 42, 0])
  mat4.scale(mat, mat, [168/32, 168/32, 1])
  let x = -0.5, y = 8.5
  c.hpub.toUpperCase().match(/.{1,16}/g).map((str, i) => {
    mat4.copy(m, mat)
    nybbleFont.draw(x,y + i*8, str, v.titleColor, v.mat, m)
  })

  mat4.identity(m)
  mat4.translate(m,m, [256, 116, 0])
  const s1 = 39/14
  mat4.scale(m,m, [s1, s1, 1])
  const w1 = v.sw - 256 - 256
  if (defaultFont.calcWidth(c.name) * s1 > w1) {
    let l = c.name.length
    while (defaultFont.calcWidth(c.name.substring(0,l)+'...') * s1 > w1) {
      l--
    }
    str = c.name.substring(0,l)+'...'
  } else {
    str = c.name
  }
  defaultFont.draw(0,0, str, v.titleColor, v.mat, m)

  let rawText = c.about || ''
  mat4.identity(m)
  mat4.translate(m,m, [255, 185, 0])
  const s2 = 28/14
  mat4.scale(m,m, [s2, s2, 1])
  if (defaultFont.calcWidth(rawText) * s2 > w1) {
    let l = rawText.length
    while (defaultFont.calcWidth(rawText.substring(0,l)+'...') * s2 > w1) {
      l--
    }
    str = rawText.substring(0,l)+'...'
  } else {
    str = rawText
  }
  defaultFont.draw(0,0, str, v.subtitleColor, v.mat, m)

  for (g of v.gadgets) if (g.renderFunc) {
    g.renderFunc()
  } else if (g.label) {
    mat4.identity(m)
    mat4.translate(m, m, [g.x, g.y+g.h, 0])
    mat4.scale(m, m, [g.h/g.fontSize, g.h/g.fontSize, 1])
    g.font.draw(0,0, g.label, g.color, v.mat, m)
  }

  mainShapes.useProg2()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(colors.inactiveDark))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [0, 265-2, 0])
  mat4.scale(m,m, [v.sw, 2, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')

}
