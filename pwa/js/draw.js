export function drawPill(v, color, x,y,w,h) {
  mainShapes.useProg2()
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
