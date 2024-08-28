import { appBar as topBar } from './appBar.js'
import { hpub, npub } from './key.js'

let v, g
export const homeView = v = new fg.View(null)
v.name = Object.keys({homeView}).pop()
v.designSize = 1080*1825
v.splashMode = 0
v.frameTimes = []
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.subtitleColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
v.loadingColor = [1-v.bgColor[0],1-v.bgColor[1],1-v.bgColor[2],1]
v.loadingText = `Satoshi, D.N.C.`//`${window.devicePixelRatio}, ${vvs = window.visualViewport.scale}`
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)  
  const m = mat4.create()
  const mat = mat4.create()

  const contacts = [
    { pubkey: hpub(), name: 'You', xmitDate: new Date(), xmitText: 'link' },
    { pubkey: hpub(), name: npub(), xmitDate: new Date(), xmitText: 'tbd' },
  ]

  let i = 0
  for (const c of contacts) {

    mat4.identity(mat)
    mat4.translate(mat, mat, [31, 204 + 200 * i, 0])
    mat4.scale(mat, mat, [127/32, 127/32, 1])
    let x = -0.5, y = 8.5
    c.pubkey.toUpperCase().match(/.{1,16}/g).map((str, i) => {
      mat4.copy(m, mat)
      nybbleFont.draw(x,y + i*8, str, v.titleColor, v.mat, m)
    })
      
    mat4.identity(m)
    mat4.translate(m,m, [192, 253 + 200 * i, 0])
    mat4.scale(m,m, [35/14, 35/14, 1])
    defaultFont.draw(0,0, c.name, v.titleColor, v.mat, m)

    mat4.identity(m)
    mat4.translate(m,m, [195, 318 + 200 * i, 0])
    mat4.scale(m,m, [31/14, 31/14, 1])
    defaultFont.draw(0,0, c.xmitText, v.subtitleColor, v.mat, m)
    
    mat4.identity(m)
    mat4.translate(m,m, [v.sw - 45, 247 + 200 * i, 0])
    mat4.scale(m,m, [25/14, 25/14, 1])
    const str = c.xmitDate.toLocaleTimeString(undefined, { hour12: true, hourCycle: 'h11', hour: 'numeric', minute: 'numeric' })
    defaultFont.draw(-defaultFont.calcWidth(str),0, str, v.subtitleColor, v.mat, m)
    
    i++
  }

  // item spacing: 200
  // photo x=31, w=127, h=127
}

export const homeOverlayView = v = new fg.View(null)
v.name = Object.keys({homeOverlayView}).pop()
v.designSize = 1080*1825
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
  mat4.translate(m,m, [g.x + 49, g.y + 95, 0])
  mat4.scale(m,m, [51/11, 51/11, 1])
  iconFont.draw(-2,0, g.label, v.buttonTextColor, v.mat, m)
}

export const homeOverlay = v = new fg.OverlayView(null)
v.name = Object.keys({homeOverlay}).pop()
v.ghostOpacity = 0
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
