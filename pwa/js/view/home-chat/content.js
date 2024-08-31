import { hpub, npub } from '../../keys.js'
import { contacts } from '../../contacts.js'
import { drawPill } from '../../draw.js'

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.splashMode = 0
v.frameTimes = []
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.subtitleColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
v.filterGads = []
for (const label of ['All', 'Unread', 'Favorites', 'Groups']) {
  v.gadgets.push(g = new fg.Gadget(v))
  v.filterGads.push(g)
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = label
  g.animValue = 0
  g.clickFunc = function() {
    const g = this, v = g.viewport
    v.activeFilter = g.label
    v.setRenderFlag(true)
  }
}
v.activeFilter = v.filterGads[0].label
v.layoutFunc = function() {
  const v = this
  let x = 42
  for (const g of v.filterGads) {
    g.x = x, g.y = 51, g.h = 86
    g.w = 33 + defaultFont.calcWidth(g.label) * 30/14 + 33
    g.autoHull()
    x += g.w + 15
  }
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)  
  const m = mat4.create()
  const mat = mat4.create()

  for (const g of v.filterGads) {
    const goal = g.label == v.activeFilter? 1: 0
    if (g.animValue != goal) {
    //   g.animValue = g.animValue * 0.1 + goal * 0.9
    //   if (Math.abs(goal - g.animValue) < 0.005) {
    //     g.animValue = goal
    //   }
    //   v.setRenderFlag(true)
    }
    // const f1 = g.animValue
    // const f0 = 1 - f1
    // const light = [
    //   colors.accent[0] * f1 + colors.inactive[0] * f0,
    //   colors.accent[1] * f1 + colors.inactive[1] * f0,
    //   colors.accent[2] * f1 + colors.inactive[2] * f0, 1]
    // const dark = [
    //   colors.accentDark[0] * f1 + colors.inactiveDark[0] * f0,
    //   colors.accentDark[1] * f1 + colors.inactiveDark[1] * f0, 
    //   colors.accentDark[2] * f1 + colors.inactiveDark[2] * f0, 1]
    const light = g.label == v.activeFilter? colors.accent: colors.inactive
    const dark = g.label == v.activeFilter? colors.accentDark: colors.inactiveDark
    drawPill(v, dark, g.x, g.y, g.w, g.h)
    mat4.identity(m)
    const s = 29/14
    mat4.translate(m,m, [g.x + (g.w - defaultFont.calcWidth(g.label) * s) / 2, g.y + 59, 0])
    mat4.scale(m,m, [s, s, 1])
    defaultFont.draw(0,0, g.label, light, v.mat, m)
  }

  let i = 0
  for (const c of [    { pubkey: hpub(), name: 'You', xmitDate: new Date(), xmitText: 'link' },
    ...contacts]) {

    mat4.identity(mat)
    mat4.translate(mat, mat, [31, 204 + 200 * i, 0])
    mat4.scale(mat, mat, [127/32, 127/32, 1])
    let x = -0.5, y = 8.5
    c.pubkey.toUpperCase().match(/.{1,16}/g).map((str, i) => {
      mat4.copy(m, mat)
      nybbleFont.draw(x,y + i*8, str, v.titleColor, v.mat, m)
    })
      
    mat4.identity(m)
    mat4.translate(m,m, [v.sw - 45, 247 + 200 * i, 0])
    const s2 = 25/14
    mat4.scale(m,m, [s2, s2, 1])
    let str = c.xmitDate.toLocaleTimeString(undefined, { hour12: true, hourCycle: 'h11', hour: 'numeric', minute: 'numeric' })
    const w1 = defaultFont.calcWidth(str)
    const w2 = w1 * s2
    defaultFont.draw(-w1,0, str, v.subtitleColor, v.mat, m)
    
    mat4.identity(m)
    mat4.translate(m,m, [192, 253 + 200 * i, 0])
    const s1 = 35/14
    mat4.scale(m,m, [s1, s1, 1])
    const w3 = v.sw - 192 - 45 - 25 - w2
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

    mat4.identity(m)
    mat4.translate(m,m, [195, 318 + 200 * i, 0])
    const s3 = 31/14
    mat4.scale(m,m, [s3, s3, 1])
    const w4 = v.sw - 192 - 45 - 25
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
    
    i++
  }

  // item spacing: 200
  // photo x=31, w=127, h=127
}

export const overlayView = v = new fg.View(null)
v.name = Object.keys({overlayView}).pop()
v.designSize = 1080*1825
v.bgColor = [0x12/0xff, 0x1b/0xff, 0x22/0xff, 1]
v.buttonFaceColor = colors.accentButtonFace
v.buttonTextColor = colors.accentButtonText
v.gadgets.push(g = v.addGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '+'
  g.clickFunc = function() {
    const g = this, v = this.viewport
    g.root.easeOut(g.target)
  }
v.layoutFunc = function() {
  const v = this
  let g
  g = v.addGad
  g.x = v.sw-189
  g.y = v.sh-189
  g.w = 147
  g.h = 147
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  const m = mat4.create()

  const g = v.addGad
  // mainShapes.useProg2()
  // gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(v.buttonFaceColor))
  // gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  // mat4.identity(m)
  // mat4.translate(m,m, [g.x, g.y, 0])
  // mat4.scale(m,m, [g.w, g.h, 1])
  // gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  // mainShapes.drawArrays2('rect')

  mat4.identity(m)
  mat4.translate(m,m, [g.x, g.y + g.h, 0])
  mat4.scale(m,m, [g.w/6, g.h/6, 1])
  iconFont.draw(0,0, `\x0a`, v.buttonFaceColor, v.mat, m)
  mat4.identity(m)
  mat4.translate(m,m, [g.x + 49, g.y + 95, 0])
  mat4.scale(m,m, [51/11, 51/11, 1])
  iconFont.draw(-2,0, g.label, v.buttonTextColor, v.mat, m)
}
