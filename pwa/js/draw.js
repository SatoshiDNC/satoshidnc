export function alpha(color, alpha) {
  return [color[0], color[1], color[2], alpha]
}

export function blend(color1, color2, factor) {
  const f1 = Math.max(0, Math.min(1, 1 - factor))
  const f2 = Math.max(0, Math.min(1, factor))
  return [color1[0]*f1+color2[0]*f2, color1[1]*f1+color2[1]*f2, color1[2]*f1+color2[2]*f2, color1[3]*f1+color2[3]*f2]
}

export function rrggbb(color) {
  return ("0"+(Number(
    ((color[0] * 0xff0000) & 0xff0000) +
    ((color[1] * 0xff00) & 0xff00) +
    ((color[2] * 0xff) & 0xff)
  ).toString(16))).slice(-2).toLowerCase()
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

export function drawAvatar(v, hpub, x,y,w,h) {
  const color = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
  const mat = mat4.create()
  const m = mat4.create()
  mat4.identity(mat)
  mat4.translate(mat, mat, [x, y, 0])
  mat4.scale(mat, mat, [w/32, h/32, 1])
  let dx = -0.5, dy = 8.5
  hpub.toUpperCase().match(/.{1,16}/g).map((str, i) => {
    mat4.copy(m, mat)
    nybbleFont.draw(dx,dy + i*8, str, color, v.mat, m)
  })
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
