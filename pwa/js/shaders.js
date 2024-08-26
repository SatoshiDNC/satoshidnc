export const plainProgram = function(gl) {

  const plainVertexShader = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(plainVertexShader, `
      attribute vec4 aVertexPosition;
      attribute vec2 aTex;
      uniform vec4 overallColor;
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      varying vec4 vColor;
      varying highp vec2 vTex;

      void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = overallColor;
        vTex = aTex;
      }
  `)
  gl.compileShader(plainVertexShader)
  if (!gl.getShaderParameter(plainVertexShader, gl.COMPILE_STATUS)) return

  const plainFragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(plainFragmentShader, `
      varying lowp vec4 vColor;
      uniform sampler2D sampler0;
      varying highp vec2 vTex;

      void main() {
        gl_FragColor = vColor;
      }
  `)
  gl.compileShader(plainFragmentShader)
  if (!gl.getShaderParameter(plainFragmentShader, gl.COMPILE_STATUS)) return

  const prog = gl.createProgram()
  gl.attachShader(prog, plainVertexShader)
  gl.attachShader(prog, plainFragmentShader)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
  return prog
  
}
