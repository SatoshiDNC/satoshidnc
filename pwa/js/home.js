import { appBar as topBar } from './appBar.js'
import { hpub } from './key.js'

let v, g
export const homeView = v = new fg.View(null)
v.name = Object.keys({homeView}).pop()
v.designSize = 640*400
v.splashMode = 0
v.frameTimes = []
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.loadingColor = [1-v.bgColor[0],1-v.bgColor[1],1-v.bgColor[2],1]
v.loadingText = `Satoshi, D.N.C.`//`${window.devicePixelRatio}, ${vvs = window.visualViewport.scale}`
v.setText = function(text) {
  this.loadingText = text
  console.log('splash:', text)
}
v.finish = function(text) {
  if (text) this.loadingText = text
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const mat = mat4.create()
  mat4.identity(mat)
  if (v.splashMode == 0 || v.splashMode == 1) {
    const str = v.loadingText
    const x = (v.sw - defaultFont.calcWidth(str))/2
    const y = (v.sh)/2
    defaultFont.draw(x,y, str, v.loadingColor, v.mat, mat)

    const now = new Date().getTime()
    let nowPrime = now
    if (v.splashMode == 0) {
      v.frameTimes.push(now)
      if (v.frameTimes.length > 30) {
        nowPrime = v.frameTimes.splice(0,1)
      }
    } else if (v.splashMode = 1) {
      if (v.loadingColor[0] > 0) {
        let val = Math.max(0,v.loadingColor[0]-1/30)
        v.loadingColor = [val, val, val, 1]
      } else {
        v.splashMode = 2
      }
    }
    if (v.loadingFinished) {
      if (v.splashMode == 0) {
        if (now - nowPrime >= 490) {
          v.splashMode = 1
        } else {
          v.splashMode = 2
        }
      }
    }
  } else if (v.splashMode == 2) {
    loadAccount()
    if (pinsettings.enablepin.state && securitypane.mode === 'unlock') {
      fg.setRoot(securitypane)
    } else {
      fg.setRoot(home)
    }
  }
  // this.setRenderFlag(true)
}

export const homeOverlayView = v = new fg.View(null)
v.name = Object.keys({homeOverlayView}).pop()
v.designSize = 1080*2183
v.bgColor = [0x12/0xff, 0x1b/0xff, 0x22/0xff, 1]
v.buttonFaceColor = colors.accentButtonFace
v.buttonTextColor = colors.accentButtonText
v.gadgets.push(g = v.addGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '+'
  g.clickFunc = function() {
    const g = this, v = this.viewport
    console.log('add')
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
  mat4.translate(m,m, [g.x + 42, g.y + 95, 0])
  mat4.scale(m,m, [43/9, 43/9, 1])
  iconFont.draw(0,0, g.label, v.buttonTextColor, v.mat, m)
}

export const homeOverlay = v = new fg.OverlayView(null)
v.name = Object.keys({homeOverlay}).pop()
v.a = homeOverlayView; homeOverlayView.parent = v
v.b = homeView; homeView.parent = v

export const homeSend = v = new fg.SliceView(null, 'br', .125)
v.name = Object.keys({homeSend}).pop()
v.prop = true
v.a = sendBar; sendBar.parent = v
v.b = homeOverlay; homeOverlay.parent = v

export const homeRoom = v = new fg.SliceView(null, 'tl', .125)
v.name = Object.keys({homeRoom}).pop()
v.prop = true
v.a = topBar; topBar.parent = v
v.b = homeSend; homeSend.parent = v

export const homeRoot = homeRoom
v = homeRoot
v.bgColor = [0,0,0,1]
