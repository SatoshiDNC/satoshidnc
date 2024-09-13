import { device, contacts, contactViewDependencies } from '../../../contacts.js'
import { drawPill } from '../../../draw.js'
import { contentView as chatRoomView } from '../../chat-room/content.js'
import { defaultKey } from '../../../keys.js'
import * as nip19 from 'nostr-tools/nip19'

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.splashMode = 0
v.frameTimes = []
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.subtitleColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
v.iconColor = colors.inactive
v.labelColor = colors.inactive
v.dataTitleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.descColor = colors.inactive
v.gadgets.push(g = v.cameraGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.w = 127, g.h = 127
  g.clickFunc = function() {
    const g = this, v = this.viewport
    console.log(`click 'camera'`)
  }
v.gadgets.push(g = v.picGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.y = 65
  g.w = 416, g.h = 416
  g.clickFunc = function() {
    const g = this, v = this.viewport
    console.log(`click 'photo'`)
  }
v.gadgets.push(g = v.nameEditGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.w = 48, g.h = 48
  g.clickFunc = function() {
    const g = this, v = this.viewport
    console.log(`click 'name edit'`)
  }
v.gadgets.push(g = v.aboutEditGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.w = 48, g.h = 48
  g.clickFunc = function() {
    const g = this, v = this.viewport
    console.log(`click 'about edit'`)
  }
v.layoutFunc = function() {
  const v = this
  let g
  g = v.picGad
  g.x = (v.sw - g.w) / 2
  g.autoHull()
  g = v.cameraGad
  g.x = v.picGad.x + 291, g.y = v.picGad.y + 297
  g.autoHull()
  g = v.nameEditGad
  g.y = 605
  g.x = v.sw - 71 - g.w
  g.autoHull()
  g = v.aboutEditGad
  g.y = 605
  g.x = v.sw - 71 - g.w
  g.autoHull()
}
contactViewDependencies.push(v)
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)  
  const m = mat4.create()
  const mat = mat4.create()
  let c = { hpub: defaultKey, name: 'Unnamed' }
  let str
  let g

  g = v.picGad
  mat4.identity(mat)
  mat4.translate(mat, mat, [g.x, g.y, 0])
  mat4.scale(mat, mat, [g.w/32, g.h/32, 1])
  let x = -0.5, y = 8.5
  c.hpub.toUpperCase().match(/.{1,16}/g).map((str, i) => {
    mat4.copy(m, mat)
    nybbleFont.draw(x,y + i*8, str, v.titleColor, v.mat, m)
  })

  g = v.cameraGad
  drawPill(v, colors.accent, g.x, g.y, g.w, g.h)
  mat4.identity(m)
  mat4.translate(m,m, [g.x + 37, g.y + 87, 0])
  const s2 = 53/20
  mat4.scale(m,m, [s2, s2, 1])
  iconFont.draw(0,0, 'C', v.bgColor, v.mat, m)

  const drawTile = (yoffset, icon, label, value, desc, last = false) => {

    mat4.identity(m)
    mat4.translate(m,m, [74, 650 + yoffset, 0])
    const s3 = 42/iconFont.calcWidth(icon)
    mat4.scale(m,m, [s3, s3, 1])
    iconFont.draw(0,0, icon, v.iconColor, v.mat, m)

    mat4.identity(m)
    mat4.translate(m,m, [192, 615 + yoffset, 0])
    const s4 = 28/14
    mat4.scale(m,m, [s4, s4, 1])
    defaultFont.draw(0,0, label, v.labelColor, v.mat, m)

    mat4.identity(m)
    mat4.translate(m,m, [192, 675 + yoffset, 0])
    const s1 = 33/14
    mat4.scale(m,m, [s1, s1, 1])
    const w1 = v.sw - 192 - 192
    if (defaultFont.calcWidth(value) * s1 > w1) {
      let l = value.length
      while (defaultFont.calcWidth(value.substring(0,l)+'...') * s1 > w1) {
        l--
      }
      str = value.substring(0,l)+'...'
    } else {
      str = value
    }
    defaultFont.draw(0,0, str, v.dataTitleColor, v.mat, m)

    let y = 0
    if (desc) {
      let buf = desc
      const s5 = 27/14
      const w5 = v.sw - 192 - 70
      while (buf.length > 0) {
        mat4.identity(m)
        mat4.translate(m,m, [192, 750 + yoffset + y, 0])
        mat4.scale(m,m, [s5, s5, 1])
        if (defaultFont.calcWidth(buf) * s5 > w5) {
          let l = buf.split(' ').length
          while (defaultFont.calcWidth(buf.split(' ').slice(0,l).join(' ')) * s5 > w5) {
            l--
          }
          str = buf.split(' ').slice(0,l).join(' ')
          defaultFont.draw(0,0, str, v.descColor, v.mat, m)
          buf = buf.split(' ').slice(l).join(' ')
          y += 44
        } else {
          str = buf
          defaultFont.draw(0,0, str, v.descColor, v.mat, m)
          buf = ''
        }
      }
    } else {
      y = -73
    }

    if (!last) {
      mainShapes.useProg2()
      gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(colors.inactiveDark))
      gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
      mat4.identity(m)
      mat4.translate(m,m, [192, 804 + yoffset + y - 1, 0])
      mat4.scale(m,m, [v.sw, 1, 1])
      gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
      mainShapes.drawArrays2('rect')
    }

    return 217 + y + 57
  }

  y = 0
  y += drawTile(y, '\x00', 'Name', c.name, 'This is not a username or pin. Changes to this name only affect this device.')

  if (y + 605 != v.aboutEditGad.y) {
    v.aboutEditGad.y = y + 605
    v.aboutEditGad.autoHull()
  }

  let rawText = c.statusText || 'I’m using Nostor!'
  y += drawTile(y, 'i', 'About', rawText)

  y += drawTile(y, '\x06', 'Nostor public key', nip19.npubEncode(c.hpub), undefined, true)

  for (g of v.gadgets) if (g.label) {
    mat4.identity(m)
    mat4.translate(m, m, [g.x, g.y+g.h, 0])
    mat4.scale(m, m, [g.h/g.fontSize, g.h/g.fontSize, 1])
    g.font.draw(0,0, g.label, g.color, v.mat, m)
  }
}
