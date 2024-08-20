const homeView = v = new fg.View(null)
v.name = Object.keys({homeView}).pop()
v.designSize = 640*400
v.splashMode = 0
v.frameTimes = []
v.bgColor = [0xfa/0xff, 0xf8/0xff, 0xf5/0xff]
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

const homeSend = v = new fg.SliceView(null, 'br', 50)
v.name = Object.keys({homeRoom}).pop()
v.a = sendBar; sendBar.parent = v
v.b = homeView; homeView.parent = v

const homeRoom = v = new fg.SliceView(null, 'tl', 50)
v.name = Object.keys({homeRoom}).pop()
v.a = roomBar; roomBar.parent = v
v.b = homeSend; homeSend.parent = v

const homeRoot = homeRoom
