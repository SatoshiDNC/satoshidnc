import { drawRoundedRect } from '../draw.js'

let v, g
export const menuView = v = new fg.View(null)
v.name = Object.keys({menuView}).pop()
v.designSize = 1080*2183
v.bgColor = [0x12/0xff, 0x1b/0xff, 0x22/0xff, 1]
v.textColor = [0xf7/0xff, 0xf8/0xff, 0xfa/0xff, 1]
v.easingState = 1
v.easingValue = 0
v.easingRate = 0.033
v.items = []
v.menuX = 482
v.menuY = 137
v.menuW = 588
v.menuH = 62 + 126 * v.currentItemCount
v.menuR = 32
v.gadgets.push(g = v.menuGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    const x = e.x / v.viewScale - v.menuX, y = e.y / v.viewScale - v.menuY
    const index = Math.floor((y - 79 - 33 / 2 + 126 / 2) / 126)
    if (index >= 0 && index < v.items.length) {
      v.items[index].handler(v.items[index], menuRoot)
      menuRoot.easeOut()
    } else {
      // console.log('menu', x, y, index)
    }
  }
v.gadgets.push(g = v.screenGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function() {
    menuRoot.easeOut()
  }
v.prepMenu = function(items) {
  const v = this
  v.items = items
  v.currentItemCount = items.length
}
v.layoutFunc = function() {
  const v = this
  v.menuX = v.sw - v.menuW - 10
  v.menuH = 62 + 126 * v.currentItemCount
  let g
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
        menuRoot.out()
        if (menuRoot.followUp) {
          setTimeout(menuRoot.followUp)
          menuRoot.followUp = undefined
        }
      }
    }
    menuRoot.ghostOpacity = v.easingValue * 0.5
    v.setRenderFlag(true)
  }
  const f1 = v.easingValue
  const f0 = 1 - f1
  const m = mat4.create()

  // mainShapes.useProg2()
  // gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(v.bgColor))
  // gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  // mat4.identity(m)
  // mat4.translate(m,m, [v.menuX, v.menuY, 0])
  // mat4.scale(m,m, [v.menuW, v.menuH * v.easingValue, 1])
  // gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  // mainShapes.drawArrays2('rect')
  drawRoundedRect(v, v.bgColor, 32, v.menuX,v.menuY,v.menuW,v.menuH * f1)

  let i = 0
  for (const item of v.items) {
    mat4.identity(m)
    mat4.translate(m,m, [v.menuX + 45, v.menuY + 79 + i * 126 + 33, 0])
    mat4.scale(m,m, [33/14, 33/14, 1])
    const c = v.textColor
    defaultFont.draw(0,0, item.label, [c[0],c[1],c[2],v.easingValue], v.mat, m)
    i++
  }
}

export const menuShim = v = new fg.OverlayView(null)
v.name = Object.keys({menuShim}).pop()
v.a = menuView; menuView.parent = v
// v.b = chatRoot; chatRoot.parent = v

export const menuRoot = menuShim
menuRoot.ghostOpacity = 0
menuRoot.easeIn = function(items) {
  const v = this
  menuView.prepMenu(items)
  menuView.easingState = 1
  menuView.easingRate = 0.06
  const r = fg.getRoot()
  if (r !== v) {
    menuShim.b = r; r.parent = menuShim
    v.ghostView = r
    fg.setRoot(v)
  }
}
menuRoot.easeOut = function() {
  const v = this
  menuView.easingState = -1
  menuView.easingRate = 0.1
  v.setRenderFlag(true)
}
menuRoot.easingState = function() {
  return menuView.easingState
}
menuRoot.out = function() {
  fg.setRoot(menuRoot.ghostView)
}
