import { setEasingParameters } from './util.js'

export const splash = v = new fg.View(null)
v.name = Object.keys({splash}).pop()
v.designSize = 640*400
v.bgColor = [0,0,0,1]
v.textColor = [1-v.bgColor[0],1-v.bgColor[1],1-v.bgColor[2],1]
v.loadingText = `initializing...`
v.setText = function(text) {
  const v = this
  if (text == v.loadingText) return
  v.loadingText = text
  console.log('init:', text)
  v.setRenderFlag(true)
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const m = mat4.create()
  // mat4.identity(mat)
  // const str = v.loadingText
  // const x = (v.sw - defaultFont.calcWidth(str))/2
  // const y = (v.sh)/2
  // defaultFont.draw(x,y, str, v.loadingColor, v.mat, mat)

  const whitespace = true
  const maxWidth = v.sw - 42
  let t,tw,th,ts
  ts = 14/14
  const paragraphs = v.loadingText.replaceAll('\x0a', `${whitespace?'¶':''}\x0a`).split('\x0a')
  const lines = []
  for (const para of paragraphs) {
    const words = para.split(' ')
    while (words.length > 0) {
      lines.push(words.shift())
      while (lines[lines.length-1] && defaultFont.calcWidth(lines[lines.length-1]) * ts >= maxWidth) {
        let buf = ''
        while (lines[lines.length-1] && defaultFont.calcWidth(lines[lines.length-1]) * ts >= maxWidth) {
          let l = lines.pop()
          buf = l.substring(l.length-1) + buf
          l = l.substring(0, l.length-1)
          lines.push(l)
        }
        lines.push(buf)
      }
      while (words.length > 0 && defaultFont.calcWidth(lines[lines.length-1] + ' ' + words[0]) * ts <= maxWidth) {
        lines.push(lines.pop() + ' ' + words.shift())
      }
    }
  }
  // tw = lines.reduce((a,c) => Math.max(a, defaultFont.calcWidth(c) * ts, 0))
  th = lines.length * defaultFont.glyphHeights[65] * ts * 2
  let i = 1
  for (let line of lines) {
    i++
    if (!line) continue
    if (whitespace) {
      line = line.replaceAll(' ', '·')
    }
    tw = defaultFont.calcWidth(line) * ts
    mat4.identity(m)
    mat4.translate(m, m, [(v.sw - tw)/2, (v.sh - th)/2 + i*defaultFont.glyphHeights[65]*ts*2, 0])
    mat4.scale(m, m, [ts, ts, 1])
    defaultFont.draw(0,0, line, v.textColor, v.mat, m)
  }
  this.renderFinish?.()
}
setEasingParameters(v)
