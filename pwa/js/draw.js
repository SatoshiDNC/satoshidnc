import { getHue, getName, getPicture, getCharacter } from './personal.js'

export function clamp(min, value, max) {
  return Math.max(min, Math.min(max, value))
}

export function alpha(color, alpha) {
  return [color[0], color[1], color[2], alpha]
}

export function blend(color1, color2, factor) {
  const f1 = Math.max(0, Math.min(1, 1 - factor))
  const f2 = Math.max(0, Math.min(1, factor))
  return [
    color1[0]*f1+color2[0]*f2,
    color1[1]*f1+color2[1]*f2,
    color1[2]*f1+color2[2]*f2,
    color1[3]*f1+color2[3]*f2,
  ]
}

export function hue(color) {
  const min = Math.min(color[0], color[1], color[2])
  const max = Math.max(color[0], color[1], color[2])
  const delta = max - min
  return delta? [
    (color[0]-min)/delta,
    (color[1]-min)/delta,
    (color[2]-min)/delta,
    color[3]
  ]: [1,1,1,color[3]]
}

export function saturation(color) {
  return Math.max(color[0],color[1],color[2]) - Math.min(color[0],color[1],color[2])
}

export function value(color) {
  const min = Math.min(color[0], color[1], color[2])
  const max = Math.max(color[0], color[1], color[2])
  const delta = max - min
  return min / (1 - delta)
}

export function setValue(color, value) {
  const h = hue(color)
  const s = saturation(color)
  const v_new = clamp(0, value, 1)
  return [
    h[0]*s + (1-s)*v_new,
    h[1]*s + (1-s)*v_new,
    h[2]*s + (1-s)*v_new,
    color[3]
  ]
}

export function color_from_rgb_integer(rgb) {
  return [((~~(rgb/0x10000))&0xff)/0xff, ((~~(rgb/0x100))&0xff)/0xff, ((~~(rgb/0x1))&0xff)/0xff, 1]
}

export function rrggbb(color) {
  return ('000000'+(Number(
    ((color[0] * 0xff0000) & 0xff0000) +
    ((color[1] * 0xff00) & 0xff00) +
    ((color[2] * 0xff) & 0xff)
  ).toString(16))).slice(-6).toLowerCase()
}

export function drawRect(v, color, x,y,w,h) {
  mainShapes.useProg2()
  const m = mat4.create()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(color))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [x, y, 0])
  mat4.scale(m,m, [w, h, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')
}

export function drawAvatar(v, hpub, x,y,w,h, hearts) {
  const color = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
  const mat = mat4.create()
  const m = mat4.create()

  const hue = getHue(hpub)
  const name = getName(hpub)
  const picture = getPicture(hpub)
  const character = getCharacter(hpub)

  let mode = 'hpub', font, char
  if (character && defaultFont.calcWidth(character.codePointAt(0))) {
    mode = 'character'
    font = defaultFont
    char = font.glyphCodes.indexOf(character.codePointAt(0))
  } else if (name && defaultFont.glyphCodes.indexOf(name.codePointAt(0)) >= 0) {
    mode = 'character'
    font = defaultFont
    char = font.glyphCodes.indexOf(character.codePointAt(0))
  }

  if (mode == 'character') {
    const bubbleColor = setValue(blend(colors.black, hue, TINGE.BACKGROUND), TINGE.BACKGROUND_BUBBLE)
    drawEllipse(v, bubbleColor, x,y,w,h)
    let i = char
    const diameter = Math.max(defaultFont.glyphWidths[i], defaultFont.glyphHeights[i])
    mat4.identity(m)
    mat4.translate(m, m, [x + w/2, y + h/2, 0])
    mat4.scale(m, m, [w/diameter/Math.SQRT2*0.9, h/diameter/Math.SQRT2*0.9, 1])
    defaultFont.draw(-(defaultFont.glyphX2[i]-defaultFont.glyphX1[i])/2, defaultFont.glyphHeights[i]-defaultFont.glyphY1[i]-defaultFont.glyphHeights[i]/2, String.fromCodePoint(char), color, v.mat, m)
  }

  if (mode == 'hpub') {
    const px = nybbleFont.calcWidth('0')
    mat4.identity(mat)
    mat4.translate(mat, mat, [x, y, 0])
    mat4.scale(mat, mat, [w/16/px, h/16/px, 1])
    let dx = 0.5, dy = 4*px - 0.5
    hpub.toUpperCase().match(/.{1,16}/g).map((str, i) => {
      mat4.copy(m, mat)
      nybbleFont.draw(dx,dy + i*4*px, str, color, v.mat, m)
    })
  }

  if (hearts) {
    let balance = Math.round(hearts)
    let rank = balance? `${Math.abs(balance)}`.length: 0
    let rankIcon = balance > 0? '💔': '❤'
    let rankColor = balance > 0? colors.brokenHeart: colors.wholeHeart

    let iter = 0
    const randomPosition = () => {
      const uniqueRandom = () => {
        const used = []
        for (let i = 0; i <= iter; i++) {
          let v = parseInt(hpub.substr(16+iter,1), 16)
          while (used.includes(v)) {
            v = (v + 1) % 16
          }
          used.push(v)
        }
        return used.pop()
      }
      const a = uniqueRandom()/16 * 2*Math.PI
      const f0 = parseInt(hpub.substr(26+iter,1), 16)/15, f1 = 1-f0
      const w2 = w/2, h2 = h/2
      iter += 1
      return { x: w2 + w2*Math.cos(a), y: h2 + h2*Math.sin(a) }
    }

    if (rank) {
      let iconScale = w/128*20/14
      for (let r = 0; r < rank; r++) {
        let {x: hx, y: hy} = randomPosition()
        mat4.identity(m)
        mat4.translate(m, m, [x+hx, y+hy, 0])
        mat4.scale(m, m, [iconScale, iconScale, 1])
        
        // defaultFont.draw(-28-d - ((r%3)==0?26:0), 0, '💗', v.bgColor, v.mat, m)
        defaultFont.draw(-14, 7, '❤', v.bgColor, v.mat, m)
        defaultFont.draw(-28, 0, rankIcon, rankColor, v.mat, m)
      }
    }
    
  }

}

export function drawPill(v, color, x,y,w,h) {
  mainShapes.useProg2()
  const m = mat4.create()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(color))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [x, y, 0])
  mat4.scale(m,m, [h, h, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('circle')
  mat4.identity(m)
  mat4.translate(m,m, [x + w - h, y, 0])
  mat4.scale(m,m, [h, h, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('circle')
  mat4.identity(m)
  mat4.translate(m,m, [x + h / 2, y, 0])
  mat4.scale(m,m, [w - h, h, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')
}

export function drawEllipse(v, color, x,y,w,h, f,a) {
  mainShapes.useProg2()
  const m = mat4.create()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(color))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  if (a) {
    mat4.translate(m,m, [x + w/2, y + h/2, 0])
    mat4.rotate(m,m, 2 * Math.PI * a, [0, 0, 1])
    mat4.translate(m,m, [-w/2, -h/2, 0])
    mat4.scale(m,m, [w, h, 1])
  } else {
    mat4.translate(m,m, [x, y, 0])
    mat4.scale(m,m, [w, h, 1])
  }
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  //mainShapes.drawArrays2('circle')
  gl.drawArrays(mainShapes.typ2['pies'],mainShapes.beg2['pies'],f? Math.round(mainShapes.len2['pies']/2*f)*2 : mainShapes.len2['pies'])
}

export function drawRoundedRect(v, color, radius, x,y,w,h) {
  let r = radius
  if (r * 2 > w || r * 2 > h) {
    r = Math.min(w, h) / 2
  }
  const d = r*2
  mainShapes.useProg2()
  const m = mat4.create()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(color))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [x, y, 0])
  mat4.scale(m,m, [d, d, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('circle')
  mat4.identity(m)
  mat4.translate(m,m, [x + w - d, y, 0])
  mat4.scale(m,m, [d, d, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('circle')
  mat4.identity(m)
  mat4.translate(m,m, [x, y + h - d, 0])
  mat4.scale(m,m, [d, d, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('circle')
  mat4.identity(m)
  mat4.translate(m,m, [x + w - d, y + h - d, 0])
  mat4.scale(m,m, [d, d, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('circle')
  mat4.identity(m)
  mat4.translate(m,m, [x + r, y, 0])
  mat4.scale(m,m, [w - d, h, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')
  mat4.identity(m)
  mat4.translate(m,m, [x, y + r, 0])
  mat4.scale(m,m, [w, h - d, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')
}
