import { getKeyboardInput } from '../../../util.js'
import { drawEllipse, alpha } from '../../../../draw.js'

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
  g.x = 44, g.y = 574, g.h = 70
  g.label = 'Channel name'
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
        if (value !== undefined) g.text = value
        g.focused = false
        v.setRenderFlag(true)
      })
      clearInterval(g.timerId), delete g.timerId
    }, 10)
  }
v.gadgets.push(g = v.descGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 44, g.y = 574 + 212 * 2, g.h = 70
  g.label = 'Describe your channel.'
  g.text = '', g.defaultValue = ''
  g.animValue = 0
  g.focusValue = 0
  g.focused = false
  g.clickFunc = v.nameGad.clickFunc
v.clear = function() {
  const v = this
  v.nameGad.text = ''
  v.descGad.text = ''
  v.setRenderFlag(true)
}
v.layoutFunc = function() {
  const v = this
  let g
  g = v.nameGad
  g.w = v.sw - 44 - 44
  g.autoHull()
  g = v.descGad
  g.w = v.sw - 44 - 44
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)  
  const m = mat4.create()
  let s

  drawEllipse(v, alpha(colors.inactive, 0.5), v.sw/2-158,74, 316,316)

  mat4.identity(m)
  mat4.translate(m,m, [v.sw/2 - 154/2, 309, 0])
  s = 154/18
  mat4.scale(m,m, [s, s, 1])
  iconFont.draw(0,0, '\x15', colors.inactive, v.mat, m)

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

  drawTextInput(v.nameGad)
  
  drawTextInput(v.descGad)

  for (g of v.gadgets) {
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
