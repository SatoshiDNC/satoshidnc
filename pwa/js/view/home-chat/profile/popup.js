import { drawAvatar, alpha } from '../../../draw.js'
import { getPersonalData } from '../../../personal.js'
import { setEasingParameters } from '../../util.js'

let v, g
export const popupView = v = new fg.View(null)
v.name = Object.keys({popupView}).pop()
v.designSize = 1080*2183
v.bgColor = [0x12/0xff, 0x1b/0xff, 0x22/0xff, 1]
v.textColor = [0xf7/0xff, 0xf8/0xff, 0xfa/0xff, 1]
v.easingState = 1
v.easingValue = 0
v.easingRate = 0.033
v.preX = 31
v.preY = 204 + 147 + 200 * 0
v.preW = 127
v.preH = 127
v.menuX = 204
v.menuY = 252
v.menuW = 672
v.menuH = 801
v.gadgets.push(g = v.infoGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.w = 53, g.h = 53, g.y = v.menuY + v.menuH - 36 - g.h
  g.icon = 'i'
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    g.target.setContact(v.hpub)
    console.log('here')
    g.root.takeOver()
    g.root.easingValue = 1
    g.root.easeOut(g.target)
  }
v.gadgets.push(g = v.menuGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    const x = e.x / v.viewScale - v.menuX, y = e.y / v.viewScale - v.menuY
    // popupRoot.easeOut()
    console.log('menu', x, y)
  }
v.gadgets.push(g = v.screenGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function() {
    popupRoot.easeOut()
  }
v.setContact = function(hpub, y) {
  const v = this
  v.hpub = hpub
  v.preY = y
}
v.layoutFunc = function() {
  const v = this
  v.menuX = (v.sw - v.menuW) / 2
  let g
  g = v.infoGad
  g.x = v.menuX + (v.menuW - g.w) / 2
  g.autoHull()
  g = v.menuGad
  g.x = v.menuX
  g.y = v.menuY
  g.w = v.menuW
  g.h = v.menuH
  g.autoHull()
  g = v.screenGad
  g.x = 0
  g.y = 0
  g.w = v.sw
  g.h = v.sh
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  if (v.easingState) {
    if (v.easingState == 1) {
      v.easingValue += v.easingRate
      if (v.easingValue >= 1) {
        v.easingValue = 1
        v.easingState = 0
      }
    }
    if (v.easingState == -1) {
      v.easingValue -= v.easingRate
      if (v.easingValue < 0) {
        v.easingValue = 0
        v.easingState = 0
        popupRoot.out()
        if (popupRoot.followUp) {
          setTimeout(popupRoot.followUp)
          popupRoot.followUp = undefined
        }
      }
    }
    popupRoot.ghostOpacity = v.easingValue * 0.5
    v.setRenderFlag(true)
  }
  const f1 = v.easingValue
  const f0 = 1 - f1
  const m = mat4.create()

  // window
  mainShapes.useProg2()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(v.bgColor))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [v.preX * f0 + v.menuX * f1, v.preY * f0 + v.menuY * f1, 0])
  mat4.scale(m,m, [v.preW * f0 + v.menuW * f1, v.preH * f0 + v.menuH * f1, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')

  const hpub = v.hpub
  drawAvatar(v, hpub, v.preX * f0 + v.menuX * f1, v.preY * f0 + v.menuY * f1, v.preW * f0 + v.menuW * f1, v.preH * f0 + v.menuW * f1)

  // soften
  mainShapes.useProg2()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(alpha([.2,.2,.2,1], 0.8)))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [v.preX * f0 + v.menuX * f1, v.preY * f0 + v.menuY * f1, 0])
  mat4.scale(m,m, [v.preW * f0 + v.menuW * f1, v.preH * f0 + v.menuW * f1, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')

  // text shadow
  mainShapes.useProg2()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(alpha(v.bgColor, 0.2)))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [v.preX * f0 + v.menuX * f1, v.preY * f0 + v.menuY * f1, 0])
  mat4.scale(m,m, [v.preW * f0 + v.menuW * f1, v.preH/v.menuH*90 * f0 + 90 * f1, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')

  mat4.identity(m)
  mat4.translate(m,m, [v.preX * f0 + (v.menuX + 24) * f1, v.preY * f0 + (v.menuY + 61) * f1, 0])
  mat4.scale(m,m, [33/14 * f1, 33/14 * f1, 1])
  let c = [1,1,1,1]
  defaultFont.draw(0,0, getPersonalData(hpub, 'name'), [c[0],c[1],c[2],f1], v.mat, m)

  // separator
  mainShapes.useProg2()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array([.2,.2,.2,1]))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [v.preX * f0 + v.menuX * f1, (v.preY + v.preW) * f0 + (v.menuY + v.menuW) * f1, 0])
  mat4.scale(m,m, [v.preW * f0 + v.menuW * f1, 3 * f1, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')

  c = colors.accent
  let g = v.infoGad
  mat4.identity(m)
  mat4.translate(m,m, [(v.preX + v.preW/2) * f0 + g.x * f1, (v.preY + v.preH) * f0 + (g.y + g.h) * f1, 0])
  mat4.scale(m,m, [g.w/18 * f1, g.h/18 * f1, 1])
  iconFont.draw(0,0, g.icon, [c[0],c[1],c[2],f1], v.mat, m)

  // let i = 0
  // for (const item of v.items) {
  //   mat4.identity(m)
  //   mat4.translate(m,m, [v.menuX + 45, v.menuY + 79 + i * 126 + 33, 0])
  //   mat4.scale(m,m, [33/14, 33/14, 1])
  //   const c = v.textColor
  //   defaultFont.draw(0,0, item.label, [c[0],c[1],c[2],v.easingValue], v.mat, m)
  //   i++
  // }
}

export const popupShim = v = new fg.OverlayView(null)
v.name = Object.keys({popupShim}).pop()
v.a = popupView; popupView.parent = v
// v.b = chatRoot; chatRoot.parent = v

export const popupRoot = popupShim
popupRoot.originalEaseOut = popupRoot.easeOut
popupRoot.ghostOpacity = 0
popupRoot.easeIn = function() {
  const v = this
  popupView.easingState = 1
  popupView.easingRate = 0.06
  const r = fg.getRoot()
  if (r !== v) {
    popupShim.b = r; r.parent = popupShim
    v.ghostView = r
    fg.setRoot(v)
  }
}
popupRoot.easeOut = function() {
  const v = this
  popupView.easingState = -1
  popupView.easingRate = 0.1
  v.setRenderFlag(true)
}
popupRoot.easingState = function() {
  return popupView.easingState
}
popupRoot.out = function() {
  fg.setRoot(popupRoot.ghostView)
}

export const popupDissolveRoot = v = new fg.View(null)
v.name = Object.keys({popupDissolveRoot}).pop()
v.bgColor = [0x12/0xff, 0x1b/0xff, 0x22/0xff, 1]
v.renderFunc = function() {
  const v = this
  console.log(`${v.name} render`)
  this.a.renderAll()
  v.renderFinish() // kludge
}
v.takeOver = function() {
  console.log('takeOver')
  const v = this
  v.a = popupRoot; popupRoot.parent = v
  // v.b = popupRoot; popupRoot.parent = v
  fg.setRoot(v)
}
setEasingParameters(v)
