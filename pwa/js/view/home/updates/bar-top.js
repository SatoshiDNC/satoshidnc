import { Buffer } from 'buffer'
import { menuView as createChannelPopup } from './create-channel-1.js'

let v, g
export const barTop = v = new fg.View()
v.name = Object.keys({barTop}).pop()
v.designHeight = 147
v.bgColor = [0.043,0.078,0.106,1]
v.textColor = [1,1,1,1]
v.gadgets.push(g = v.menuGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = ':'
  g.font = iconFont
  g.fontSize = 11
  g.handleSettings = function(item, parentRoot) {
    const g = this, v = this.viewport
    console.log(`settings ${JSON.stringify(item)}`)
    const handleAction = () => {
      barTop.menuGad.root.easeOut(barTop.menuGad.targetSettings)
    }
    if (fg.getRoot() === parentRoot) {
      parentRoot.followUp = handleAction
    } else {
      handleAction()
    }
  }
  g.handleSequential = function(item, parentRoot) {
    const g = this, v = this.viewport
    console.log(`serial item ${JSON.stringify(item)}`)
    const handleAction = () => {
      item.subhandler()
    }
    if (fg.getRoot() === parentRoot) {
      parentRoot.followUp = handleAction
    } else {
      handleAction()
    }
  }
  g.items = [
    { id: 1, label: 'Create channel', handler: g.handleSequential, subhandler: createChannelPopup.invoker },
    { id: 2, label: 'Status privacy', handler: g.handler },
    { id: 3, label: 'Settings', handler: g.handleSettings },
  ]
  g.clickFunc = function() {
    const g = this, v = this.viewport
    if (fg.getRoot() !== g.target || g.target.easingState() == -1) {
      g.target?.easeIn?.(g.items)
    } else {
      g.target?.easeOut?.()
    }
  }
v.gadgets.push(g = v.searchGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '?'
  g.font = iconFont
  g.fontSize = 11
  g.clickFunc = function() {
    const g = this, v = this.viewport
    console.log(`click '${g.label}'`)
  }
v.gadgets.push(g = v.lawGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '='
  g.font = iconFont
  g.fontSize = 11
  g.clickFunc = function() {
    const g = this, v = this.viewport
    console.log(`click '${g.label}'`)
  }
v.layoutFunc = function() {
  const v = this
  g = v.menuGad
  g.x = v.sw - 64
  g.y = 51
  g.w = 12
  g.h = 45
  g.autoHull()
  g = v.searchGad
  g.x = v.sw - 192
  g.y = 51
  g.w = 45
  g.h = 45
  g.autoHull()
  g = v.lawGad
  g.x = v.sw - 322
  g.y = 51
  g.w = 45
  g.h = 45
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const m = mat4.create()
  mat4.identity(m)
  mat4.translate(m, m, [46, 98, 0])
  mat4.scale(m, m, [45/14, 45/14, 1])
  let x = 0, y = 0
  defaultFont.draw(x,y, 'Updates', v.textColor, v.mat, m)

  for (g of v.gadgets) {
    mat4.identity(m)
    mat4.translate(m, m, [g.x, g.y+g.h, 0])
    mat4.scale(m, m, [g.h/g.fontSize, g.h/g.fontSize, 1])
    g.font.draw(0,0, g.label, v.textColor, v.mat, m)
  }

  mainShapes.useProg2()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(colors.inactiveDark))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [0, v.sh-2, 0])
  mat4.scale(m,m, [v.sw, 2, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')
}

