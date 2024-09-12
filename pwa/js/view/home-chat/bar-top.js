import { trezorConnect, trezorPing, trezorWipe } from '../../trezor.js'
import { menuView as trezorTools } from './trezor-tools.js'
import { Buffer } from 'buffer'

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
  g.handler = function(item) {
    console.log(`id ${JSON.stringify(item)}`)
  }
  g.copyResult = function(item, parentRoot) {
    navigator.clipboard.writeText(barTop.menuGad.computationResult)
  }
  g.sha256 = function(item, parentRoot) {
    const g = this
    setTimeout(() => {
      const handleAction = () => {
        const text = prompt(item.label)
        if (text !== null) {
          window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(bytes => {
            const hash = Buffer.from(bytes).toString('hex')
            barTop.menuGad.computationResult = hash
          })
        }
      }
      if (fg.getRoot() === parentRoot) {
        parentRoot.followUp = handleAction
      } else {
        handleAction()
      }
    },10)
  }
  g.indexHash = function(item, parentRoot) {
    const g = this
    setTimeout(() => {
      const handleAction = () => {
        const text = prompt(item.label)
        if (text !== null) {
          window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(bytes => {
            const hash = Buffer.from(bytes).toString('hex')
            const index = '' + (parseInt(hash.substring(0,8), 16) & 0x7fffffff)
            barTop.menuGad.computationResult = index
          })
        }
      }
      if (fg.getRoot() === parentRoot) {
        parentRoot.followUp = handleAction
      } else {
        handleAction()
      }
    },10)
  }
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
  g.items = [
    { id: 1, handler: g.handler, label: 'New group' },
    { id: 2, handler: g.handler, label: 'New broadcast' },
    { id: 3, handler: g.handler, label: 'Linked devices' },
    { id: 4, handler: g.handler, label: 'Starred messages' },
    { id: 5, label: 'Settings', handler: g.handleSettings },
    // { id: 6, label: 'Compute SHA-256', handler: g.sha256 },
    // { id: 7, label: 'Compute index hash', handler: g.indexHash },
    // { id: 8, label: 'Copy result', handler: g.copyResult },
    { id: 9, label: 'Trezor tools', handler: trezorTools.invoker },
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
  mat4.translate(m, m, [139, 97, 0])
  mat4.scale(m, m, [1/14*44, 1/14*44, 1])
  let x = 0, y = 0
  defaultFont.draw(x,y, 'Settings', v.textColor, v.mat, m)

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

