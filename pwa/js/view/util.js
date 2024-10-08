export const setEasingParameters = function(v) {
  v.easingState = 1
  v.easingValue = 0
  v.easingRate = 0.033
  v.renderFinish = function() {
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
          v.easingTarget.easingState = 1
          v.easingTarget.easingValue = 0
          fg.setRoot(v.easingTarget)
        }
      }
      v.setRenderFlag(true)
    }
    if (v.easingValue < 1) {
      const m = mat4.create()
  
      mainShapes.useProg2()
      gl.enable(gl.BLEND)
      gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array([v.bgColor[0],v.bgColor[1],v.bgColor[2], 1-v.easingValue]))
      gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
      mat4.identity(m)
      mat4.scale(m,m, [v.sw, v.sh, 1])
      gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
      mainShapes.drawArrays2('rect')
    }
  }
  v.easeOut = function(targetView) {
    const v = this
    v.easingState = -1
    v.easingRate = 0.1
    v.easingTarget = targetView
    v.setRenderFlag(true)
  }  
}

export function getKeyboardInput(title, defaultValue, handler) {
  //navigator.virtualKeyboard.show()
  //document.getElementById("input").focus()
  let s = prompt(title, defaultValue)
  if (s !== null) {
    while (s.includes('  ')) {
      s = s.replace('  ', ' ')
    }
    handler(s.trim())
    return
  }
  handler()
}