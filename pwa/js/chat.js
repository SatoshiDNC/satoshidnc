import { roomBar } from './roomBar.js'
import { hpub } from './key.js'

export const chatView = v = new fg.View(null)
v.name = Object.keys({chatView}).pop()
v.designSize = 640*400
v.splashMode = 0
v.frameTimes = []
v.bgColor = [0xfa/0xff, 0xf8/0xff, 0xf5/0xff, 1]
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

export const chatSend = v = new fg.SliceView(null, 'br', .125)
v.name = Object.keys({chatSend}).pop()
v.prop = true
v.a = sendBar; sendBar.parent = v
v.b = chatView; chatView.parent = v

export const chatRoom = v = new fg.SliceView(null, 'tl', .125)
v.name = Object.keys({chatRoom}).pop()
v.prop = true
v.a = roomBar; roomBar.parent = v
v.b = chatSend; chatSend.parent = v

export const chatRoot = v = chatRoom
v.bgColor = [0,0,0,1]
v.easingState = 1
v.easingValue = 0
v.easingRate = 0.033
v.renderFinish = function() {
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
        fg.setRoot(roomBar.backGad.target)
      }
    }
    v.setRenderFlag(true)
  }
//  if (v.easingValue < 1) {
    console.log('rendering')
    const m = mat4.create()

    mainShapes.useProg2()
    gl.enable(gl.BLEND)
    gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array([v.bgColor[0],v.bgColor[1],v.bgColor[2], 0.5]))
    gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
    mat4.identity(m)
    //mat4.translate(m,m, [0, v.menuY, 0])
    mat4.scale(m,m, [v.sw, v.sh, 1])
    gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
    mainShapes.drawArrays2('rect')
//  }
}
v.easeOut = function() {
  const v = this
  v.easingState = -1
  v.easingRate = 0.1
  v.setRenderFlag(true)
}
