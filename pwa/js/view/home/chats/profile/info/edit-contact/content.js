import { getKeyboardInput } from '../../../../../util.js'
import { getName, getCharacter, getPersonalData } from '../../../../../../personal.js'

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.splashMode = 0
v.frameTimes = []
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.hintColor = [0xb5/0xff, 0xb9/0xff, 0xbc/0xff, 1]
v.textColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.iconColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
v.gadgets.push(g = v.nameGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 183, g.y = 100, g.h = 70
  g.label = 'Name on this device'
  g.icon = '\x00'
  g.text = '', g.defaultValue =''//'Satoshi, D.N.C.'
  g.animValue = 0
  g.focusValue = 0
  g.focused = false
  g.clickFunc = function() {
    const g = this, v = this.viewport
    g.focused = true
    v.setRenderFlag(true)
    g.timerId = setInterval(() => {
      if (g.focusValue != 1) return
      getKeyboardInput(g.label, g.text || g.defaultValue, value => {
        if (value !== undefined) {
          g.text = value
          g.validatorFunc?.()
        }
        g.focused = false
        v.setRenderFlag(true)
      })
      clearInterval(g.timerId), delete g.timerId
    }, 10)
  }
// v.gadgets.push(g = v.pubkeyGad = new fg.Gadget(v))
//   g.actionFlags = fg.GAF_CLICKABLE
//   g.x = 183, g.y = v.gadgets[v.gadgets.length-2].y + 212, g.h = 70
//   g.label = 'Nostor public key'
//   g.icon = '\x06'
//   g.text = '', g.defaultValue = ''//'npub128rrvpkys0wfk3ph8682yszffwqsre9j8kjhnutlasv4q2fq06vsez5dlf'
//   g.animValue = 0
//   g.focusValue = 0
//   g.focused = false
//   g.clickFunc = v.nameGad.clickFunc
v.gadgets.push(g = v.charGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 183, g.y = v.gadgets[v.gadgets.length-2].y + 212, g.h = 70
  g.label = 'Character'
  g.icon = '\x06'
  g.text = '', g.defaultValue = '\u{1f600}'
  g.animValue = 0
  g.focusValue = 0
  g.focused = false
  g.clickFunc = v.nameGad.clickFunc
  g.validatorFunc = function() {
    const g = this
    g.text = String.fromCodePoint(g.text.codePointAt(0))
  }
v.gadgets.push(g = v.relayGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 183, g.y = v.gadgets[v.gadgets.length-2].y + 212, g.h = 70
  g.label = 'Relay'
  g.icon = '\x06'
  g.text = '', g.defaultValue = 'relay.satoshidnc.com'
  g.animValue = 0
  g.focusValue = 0
  g.focused = false
  g.clickFunc = v.nameGad.clickFunc
v.clear = function() {
  const v = this
  v.hpub = undefined
  v.nameGad.text = ''
  // v.pubkeyGad.text = ''
  v.relayGad.text = ''
  v.setRenderFlag(true)
}
v.setContext = function(hpub) {
  const v = this
  v.hpub = hpub
  v.nameGad.text = getName(hpub)
  // v.pubkeyGad.text = hpub
  v.charGad.text = getCharacter(hpub)
  v.relayGad.text = getPersonalData(hpub, 'relay')
  v.setRenderFlag(true)
}
v.layoutFunc = function() {
  const v = this
  for (const g of [v.nameGad, /* v.pubkeyGad, */ v.charGad, v.relayGad]) {
    g.w = v.sw - 183 - 73
    g.autoHull()
  }
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)  
  const m = mat4.create()
  let s

  const drawTextInput = (g) => {
    let goal = g.focused || g.text? 1: 0
    if (goal != g.animValue) {
      g.animValue = g.animValue * 0.7 + goal * 0.3
      if (Math.abs(goal - g.animValue) < 0.005) {
        g.animValue = goal
      }
      v.setRenderFlag(true)
    }
    goal = g.focused? 1: 0
    if (goal != g.focusValue) {
      g.focusValue = g.focusValue * 0.7 + goal * 0.3
      if (Math.abs(goal - g.focusValue) < 0.005) {
        g.focusValue = goal
      }
      v.setRenderFlag(true)
    }
    const f1 = g.animValue
    const f0 = 1 - f1
    const g1 = g.focusValue
    const g0 = 1 - g1
    mat4.identity(m)
    mat4.translate(m,m, [g.x + 3, g.y + 47 * f0 - 26 * f1, 0])
    const s = 33/14 * f0 + 25/14 * f1
    mat4.scale(m,m, [s, s, 1])
    let c = [
      v.hintColor[0] * g0 + colors.activeText[0] * g1,
      v.hintColor[1] * g0 + colors.activeText[1] * g1,
      v.hintColor[2] * g0 + colors.activeText[2] * g1,
    1]
    defaultFont.draw(0,0, g.label, c, v.mat, m)
    if (g.text) {
      mat4.identity(m)
      mat4.translate(m,m, [g.x + 3, g.y + 47, 0])
      const s = 33/14
      mat4.scale(m,m, [s, s, 1])
      let str
      const max = g.w - 3
      if (defaultFont.calcWidth(g.text) * s > max) {
        let l = g.text.length
        while (defaultFont.calcWidth(g.text.substring(0,l)+'...') * s > max) {
          l--
        }
        str = g.text.substring(0,l)+'...'
      } else {
        str = g.text
      }
      defaultFont.draw(0,0, str, v.textColor, v.mat, m)
    }

    c = [
      v.iconColor[0] * g0 + colors.activeText[0] * g1,
      v.iconColor[1] * g0 + colors.activeText[1] * g1,
      v.iconColor[2] * g0 + colors.activeText[2] * g1,
    1]
    mainShapes.useProg2()
    gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(c))
    gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
    mat4.identity(m)
    mat4.translate(m,m, [g.x, g.y + 67, 0])
    mat4.scale(m,m, [g.w, 3, 1])
    gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
    mainShapes.drawArrays2('rect')
  }

  let y = 0
  for (const g of [v.nameGad, /* v.pubkeyGad, */ v.charGad, v.relayGad]) {
    mat4.identity(m)
    mat4.translate(m,m, [73, 158 + y, 0])
    s = 43/iconFont.calcWidth(g.icon)
    mat4.scale(m,m, [s, s, 1])
    iconFont.draw(0,0, g.icon, v.iconColor, v.mat, m)
  
    drawTextInput(g)
    y += 212
  }
  
  for (const g of v.gadgets) {
    if (g.animValue != 0 && g.animValue != 1) {
      v.setRenderFlag(true)
      break
    }
    if (g.focusValue != 0 && g.focusValue != 1) {
      v.setRenderFlag(true)
      break
    }
  }
}
