import { defaultKey } from '../../../keys.js'
import { getPersonalData as getAttr } from '../../../personal.js'

let v, g
const m = mat4.create()
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.splashMode = 0
v.frameTimes = []
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.subtitleColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
const settingsPages = [
  { h: 237, title: 'Manage storage', subtitle: '4.8 GB' },
  { title: 'Network usage', subtitle: '2.2 GB sent · 9.7 GB received' },
  { title: 'Use less data for calls' },
  { title: 'Proxy', subtitle: 'Off' },
  { title: 'Media upload quality', subtitle: 'Standard quality' },
  { title: 'Media auto-download', subtitle: 'Voice messages are always automatically downloaded' },
  { title: 'When using mobile data', subtitle: 'Photos' },
  { title: 'When connected on Wi-Fi', subtitle: 'All media' },
  { title: 'When roaming', subtitle: 'No media' },
]
let i = 0, y = 0
for (const p of settingsPages) {
  v.gadgets.push(g = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.class = 'settings'
  g.x = 0, g.y = y
  g.h = p.h || 210
  g.title = p.title
  g.subtitle = p.subtitle
  g.clickFunc = function() {
    const g = this, v = g.viewport
    console.log('click:', g.title)
    // g.root.easeOut(g.target)
  }
  g.renderFunc = function() {
    const g = this, v = g.viewport
    const offset = 22 // title's vertical shift depending on subtitle presence
    const subtitleMissing = g.subtitle? 0: 1
    let t

    mat4.identity(m)
    mat4.translate(m,m, [g.x + 190, g.y + 90 /*367*/ + offset*subtitleMissing, 0])
    const s1 = 33/14
    mat4.scale(m,m, [s1, s1, 1])
    const w3 = v.sw - 190 - 65
    if (defaultFont.calcWidth(g.title) * s1 > w3) {
      let l = g.title.length
      while (defaultFont.calcWidth(g.title.substring(0,l)+'...') * s1 > w3) {
        l--
      }
      t = g.title.substring(0,l)+'...'
    } else {
      t = g.title
    }
    defaultFont.draw(0,0, t, v.titleColor, v.mat, m)

    if (!subtitleMissing) {
      mat4.identity(m)
      mat4.translate(m,m, [g.x + 190, g.y + 156 /*433*/, 0])
      const s3 = 29/14
      mat4.scale(m,m, [s3, s3, 1])
      const w4 = v.sw - 190 - 65
      if (defaultFont.calcWidth(g.subtitle) * s3 > w4) {
        let l = g.subtitle.length
        while (defaultFont.calcWidth(g.subtitle.substring(0,l)+'...') * s3 > w4) {
          l--
        }
        t = g.subtitle.substring(0,l)+'...'
      } else {
        t = g.subtitle
      }
      defaultFont.draw(0,0, t, v.subtitleColor, v.mat, m)
    }
  }
  i++
  y+=g.h
}
v.gadgets.push(g = v.swipeGad = new fg.SwipeGadget(v))
  g.actionFlags = fg.GAF_SWIPEABLE_UPDOWN|fg.GAF_SCROLLABLE_UPDOWN
v.layoutFunc = function() {
  const v = this
  v.minX = 0, v.maxX = v.sw
  v.minY = 0 //, v.maxY = v.sh*2
  let g
  let max = 0
  for (const g of v.gadgets) {
    if (g.class == 'settings') {
      g.w = v.sw
      g.autoHull()
      max = Math.max(max, g.y+g.h)
    }
  }
  v.maxY = max
  g = v.swipeGad
  g.layout.call(g)
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)  

  for (g of v.gadgets) {
    g.renderFunc?.()
  }

  mainShapes.useProg2()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(colors.inactiveDark))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [0, 265-2, 0])
  mat4.scale(m,m, [v.sw, 2, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')

}
