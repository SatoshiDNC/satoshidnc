import { drawPill, drawRect, drawEllipse, alpha, rrggbb } from '../../../../draw.js'
import { contentView } from './content.js'
import { defaultKey, sign } from '../../../../keys.js'
import { getRelay } from '../../../../nostor-app.js'

let v, g
export const overlayView = v = new fg.View(null)
v.name = Object.keys({overlayView}).pop()
v.designSize = 1080*1825
v.buttonFaceColor = alpha(colors.black, 0.5)
v.buttonTextColor = colors.white
v.titleColor = colors.white
v.subtitleColor = colors.softWhite
v.pause = false
v.gadgets.push(g = v.closeGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 34, g.y = 34, g.w = 110, g.h = 110
  g.icon = '\x12'
  g.autoHull()
  g.clickFunc = function() {
    const g = this, v = this.viewport
    //g.root.easeOut(g.target)
    v.returnView.b.b.clearQuery()
    v.returnView.easingState = 1
    v.returnView.easingValue = 0
    fg.setRoot(v.returnView)
  }
v.gadgets.push(g = v.emojiGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 34, g.y = 34, g.w = 110, g.h = 110
  g.icon = '\x10'
  g.clickFunc = function() {
    const g = this, v = this.viewport
  }
v.gadgets.push(g = v.fontGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 34, g.y = 34, g.w = 110, g.h = 110
  g.icon = 'T'
  g.font = defaultFont
  g.clickFunc = function() {
    const g = this, v = this.viewport
  }
v.gadgets.push(g = v.paletteGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 34, g.y = 34, g.w = 110, g.h = 110
  g.icon = '\x11'
  g.clickFunc = function() {
    const g = this, v = this.viewport
    contentView.randomColor()
  }
v.gadgets.push(g = v.audienceGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 34, g.y = 34, g.w = 110, g.h = 110
  g.label = 'Status (Public)'
  g.textSize = 29
  g.clickFunc = function() {
    const g = this, v = this.viewport
  }
v.gadgets.push(g = v.micSendGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 20, g.y = 20, g.w = 128, g.h = 128
  g.iconMic = '\x13'
  g.iconSend = '\x14'
  g.icon = g.iconMic
  g.iconSquare = true
  g.buttonFaceColor = colors.accent
  g.buttonTextColor = colors.background
  g.clickFunc = function() {
    const g = this, v = this.viewport
    if (contentView.textGad.text) {
      console.log('send')
      const note = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        content: `${contentView.textGad.text}`,
        tags: [
          ['bgcolor', `${rrggbb(contentView.bgColor)}`],
        ],
      }
      sign(defaultKey, note).then(event => {
        console.log(event)
        console.log('sending...')
        const name = 'relay.satoshidnc.com'
        getRelay(name).then(relay => {
          let sent = false
          try {
            relay.sendEvent(event)
            sent = true
          } catch (reason) {
            alert(`send to ${relay.url} failed: ${reason}`)
          }
          if (sent) {
            v.closeGad.clickFunc()
          }
        }, reason => {
          alert(`connect to ${name} failed: ${reason}`)
        })
      }).catch(reason => {
        alert(reason)
      })
    } else {
      console.log('mic')
      navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      }).then(stream => {
        const recorder = new MediaRecorder(stream)
        let chunks = []

        setTimeout(() => {
          recorder.start()
          console.log(recorder.state)
          console.log(`recorder started`, new Date())
        })

        setTimeout(() => {
          recorder.stop()
          console.log(recorder.state)
          console.log(`recorder stopped`, new Date())
        }, 60 * 1000)

        recorder.onstop = e => {
          console.log("data available after MediaRecorder.stop() called.")

          // const clipName = prompt("Enter a name for your sound clip")

          // const clipContainer = document.createElement("article")
          // const clipLabel = document.createElement("p")
          const audio = document.createElement("audio")
          // const deleteButton = document.createElement("button")
          // const mainContainer = document.querySelector("body")

          // clipContainer.classList.add("clip")
          audio.setAttribute("controls", "")
          // deleteButton.textContent = "Delete"
          // clipLabel.textContent = clipName

          // clipContainer.appendChild(audio)
          // clipContainer.appendChild(clipLabel)
          // clipContainer.appendChild(deleteButton)
          // mainContainer.appendChild(clipContainer)

          audio.controls = true
          const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" })
          const audioURL = URL.createObjectURL(blob)
          audio.src = audioURL
          let tracks = stream.getTracks()
          tracks.forEach(track => track.stop())          
          console.log("recorder stopped", audioURL)

          // deleteButton.onclick = (e) => {
          //   const evtTgt = e.target
          //   evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode)
          // }
        }

        recorder.ondataavailable = e => {
          chunks.push(e.data)
          console.log(`data push`)
        }

        // const tracks = stream.getAudioTracks()
        // console.log(`Got stream with constraints`)
        // console.log(`Using device: ${tracks[0].label}`)
        // stream.onremovetrack = () => {
        //   console.log("Stream ended")
        // }
        // // video.srcObject = stream
      }).catch(error => {
        if (error.name === 'OverconstrainedError') {
          console.error(
            `The resolution is not supported by your device.`,
          )
        } else if (error.name === 'NotAllowedError') {
          console.error(
            `You need to grant this page permission to access your microphone.`,
          )
        } else {
          console.error(`getUserMedia error: ${error.name}`, error)
        }
      })
    }
  }
v.setContext = function() {
  const v = this
}
v.layoutFunc = function() {
  const v = this
  let g
  g = v.paletteGad
  g.x = v.sw - 34 - g.w
  g.autoHull()
  g = v.fontGad
  g.x = v.paletteGad.x - 16 - g.w
  g.autoHull()
  g = v.emojiGad
  g.x = v.fontGad.x - 16 - g.w
  g.autoHull()
  g = v.audienceGad
  g.x = 21, g.y = v.sh - 126, g.w = 62 + defaultFont.calcWidth(g.label)*g.textSize/14, g.h = 84
  g.autoHull()
  g = v.micSendGad
  g.x = v.sw - 20 - g.w, g.y = v.sh - 20 - g.h
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  const m = mat4.create()

  drawRect(v, alpha(colors.black, 0.70), 0,v.sh-168, v.sw,168)

  for (g of v.gadgets) {
    if (g.label) {
      drawPill(v, colors.inactiveDark, g.x,g.y, g.w,g.h)
      const font = g.font || defaultFont
      const s = g.textSize/14
      mat4.identity(m)
      mat4.translate(m, m, [g.x+g.w/2-font.calcWidth(g.label)*s/2, g.y+g.h/2+g.textSize/2, 0])
      mat4.scale(m, m, [s, s, 1])
      font.draw(0,0, g.label, v.buttonTextColor, v.mat, m)
    } else if (g.icon) {
      drawEllipse(v, g.buttonFaceColor || v.buttonFaceColor, g.x,g.y, g.w,g.h)
      const font = g.font || iconFont
      const c = g.icon.codePointAt(0)
      const gi = font.glyphCodes.indexOf(c)
      const iw = font.calcWidth(g.icon)
      const ih = g.iconSquare? iw : font.glyphHeights[gi]
      const s = 53/ih
      mat4.identity(m)
      mat4.translate(m, m, [g.x+g.w/2-(53/ih*iw)/2, g.y+g.h/2+53/2, 0])
      mat4.scale(m, m, [s, s, 1])
      font.draw(0,0, g.icon, g.buttonTextColor || v.buttonTextColor, v.mat, m)
    }
  }

}
