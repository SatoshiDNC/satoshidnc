export const setEasingParameters = function(v) {
  v.easingState = 1
  v.easingValue = 0
  v.easingRate = 0.033
  v.renderFinish = function() {
    const v = this
    // console.log(`${v.name} renderFinish`, v.easingValue, v.easingRate, v.easingState, v.easingTarget?.name)
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
    // console.log(`${v.name} easeOut`)
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

const ONE_DAY = 1 * 24 * 60 * 60 * 1000
const ONE_HOUR = 1 * 60 * 60 * 1000

export function updatePostedAsOf(timeStamp, full = false) {
  // assumption: timeStamp is within past 24 hours
  const now = Date.now()
  if (now - timeStamp < ONE_DAY) {
    if (now - timeStamp < 0) {
      return `Future`
    } else if (Math.floor((now - timeStamp) / ONE_HOUR * 60) <= 1) {
      return `Now`
    } else if (now - timeStamp < ONE_HOUR) {
      return `${Math.floor((now - timeStamp) / ONE_HOUR * 60)} minutes ago`
    } else if (new Date(timeStamp).getDate() == new Date(now).getDate()) {
      return `${new Date(timeStamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    } else {
      return `Yesterday`
    }
  }
  return addedOn(timeStamp)
}

export function addedOn(timeStamp) {
  const now = Date.now()
  if (Math.abs(now - timeStamp) < ONE_DAY && new Date(timeStamp).getDate() == new Date(now).getDate()) {
    return `Added today`
  } else if (now - timeStamp < 2 * ONE_DAY && new Date(timeStamp).getDate() == new Date(now).getDate() - 1) {
    return `Added yesterday`
  } else if (now - timeStamp < 6 * ONE_DAY) {
    return `Added on ${new Date(timeStamp).toLocaleDateString('en-US', { weekday: 'long' })}`
  } else if (now - timeStamp < 360 * ONE_DAY) {
    return `Added on ${new Date(timeStamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
  } else {
    return `Added on ${new Date(timeStamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
  }
}