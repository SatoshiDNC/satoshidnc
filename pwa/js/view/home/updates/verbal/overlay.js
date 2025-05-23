import { drawPill, drawRect, drawEllipse, drawAvatar, alpha, rrggbb } from '../../../../draw.js'
import { contentView } from './content.js'
import { signBatch as sign, prepEvent as prep, serializeEvent as ser, keys, getKeyInfo, putDeviceKey, putVolatileKey, useVolatileKey } from '../../../../keys.js'
import { aggregateEvent } from '../../../../content.js'
import { homeRelay } from '../../../../nostor-app.js'
import { getPersonalData } from '../../../../personal.js'
import { getPubkey } from '../../../../nostor-util.js'
import { getKeyboardInput } from '../../../util.js'
import * as nip19 from 'nostr-tools/nip19'
import { encrypt, decrypt } from '../../../../storage.js'
import { randomBytes } from '@noble/hashes/utils'
import { crypt } from '../../../../cryption.js'

const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

let v, g
export const overlayView = v = new fg.View(null)
v.name = Object.keys({overlayView}).pop()
v.designSize = 1080*1825
v.buttonFaceColor = alpha(colors.black, 0.5)
v.buttonTextColor = colors.white
v.titleColor = colors.white
v.subtitleColor = colors.softWhite
v.pause = false
v.selectorOpen = false
v.selectorAnimValue = 0
v.selectorY = 0
v.selectorItem = undefined
v.gadgets.push(g = v.closeGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 34, g.y = 34, g.w = 110, g.h = 110
  g.icon = '\x12'
  g.autoHull()
  g.clickFunc = function() {
    const g = this, v = this.viewport
    const rv = v.returnView || v.returnViewDefault
    //g.root.easeOut(g.target)
    rv.b?.b?.queryFunc?.()
    rv.easingState = 1
    rv.easingValue = 0
    fg.setRoot(rv)
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
  g.actionFlags = fg.GAF_CLICKABLE | fg.GAF_DRAGGABLE
  g.x = 20, g.y = 20, g.w = 128, g.h = 128
  g.iconMic = '\x13'
  g.iconSend = '\x14'
  g.icon = g.iconMic
  g.iconSquare = true
  g.buttonFaceColor = colors.accent
  g.buttonTextColor = colors.background
  g.renderFunc = function() {
    const g = this, v = g.viewport
    const m = mat4.create()
    const scrunch = 0.95
    drawPill(v, g.buttonFaceColor || v.buttonFaceColor, g.x - g.h * scrunch, g.y, g.w + g.h * scrunch, g.h)
    drawRect(v, colors.inactiveDark, g.x - g.h * scrunch, g.y, g.h, g.h)
    drawAvatar(v, v.hpub, g.x - g.h * scrunch, g.y, g.h, g.h)
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
  g.calcSwipeDir = function(p) {
    const x = p.x - p.ox
    const y = p.y - p.oy
    return (x*x>y*y)?((x>0)?'right':'left'):((y>0)?'down':'up')
  }
  g.dragBeginFunc = function(p) {
    const g = this, v = g.viewport
    v.selectorY = p.y / v.getScale()
    v.selectorOpen = false
    v.setRenderFlag(true)
  }
  g.dragMoveFunc = function(p) {
    const g = this, v = g.viewport
    v.selectorY = p.y / v.getScale()
    v.selectorOpen = g.calcSwipeDir(p) == 'up'
    v.setRenderFlag(true)
  }
  g.dragEndFunc = function(p) {
    const g = this, v = g.viewport
    v.selectorY = p.y / v.getScale()
    v.selectorOpen = false
    v.setRenderFlag(true)
    if (v.selectorItem?.hpub) {
      v.hpub = v.selectorItem.hpub
    } else if (v.selectorItem?.option == 'nsec') {
      getKeyboardInput('Nostor secret key', '', value => {
        if (value !== undefined) {

          let hsec

          // If it's a hex key, use it verbatim
          if (value.length == 64 && Array.from(value.toLowerCase()).reduce((pre, cur) => pre && '01234566789abcdef'.includes(cur), true)) {
            hsec = value.toLowerCase()
          }

          // Otherwise...
          if (!hsec) {

            // Strip the nostr: URL scheme, if present
            let bech32 = value
            if (value.startsWith('nostr:')) {
              bech32 = value.substring(6)
            }

            // Handle Bech32-encoded formats
            try {
              const decoded = nip19.decode(bech32)
              if (decoded?.type == 'nsec') {
                hsec = decoded.data
              }
            } catch(e) {
              if (bech32.startsWith('nsec')) {
                alert(`${e}`)
                return
              }
            }
          }

          // If we couldn't recognize the key, error and return early
          if (!hsec) {
            alert(`Unrecognized secret key format. Supported formats include: nsec, hex`)
            return
          }

          // We have the hex secret key; use it
          const hpub = getPubkey(hsec)
          v.hpub = hpub
          useVolatileKey(hpub, hsec)
          v.setRenderFlag(true)

          // housekeeping
          setTimeout(() => {
            const name = getName(hpub)
            const keyInfo = getKeyInfo(hpub)
            console.log('public key data:', hpub, name, keyInfo)
            if (!keyInfo) {
              if (confirm(`Remember this secret key on this device?`)) {
                putDeviceKey(hpub, hsec)
              } else {
                putVolatileKey(hpub)
              }
            }
          }, 10)
          
        }
        v.setRenderFlag(true)
      })
    }
  }
  g.clickFunc = function() {
    const g = this, v = this.viewport
    if (contentView.textGad.text) {
      console.log('send')
      const cryption_key = randomBytes(44) // generate a fresh encryption/decryption key for every upload
      console.log(cryption_key)
      const plaintext = new Uint8Array(new TextEncoder().encode(contentView.textGad.text))
      const ciphertext = crypt(0, plaintext, cryption_key)
      let pendingNote
      prep(v.hpub, {
        kind: 1, content: `${hex(ciphertext)}`,
        tags: [
          ['bgcolor', `${rrggbb(contentView.bgColor)}`],
          ['expiration', `${Math.ceil((Date.now() + ONE_DAY_IN_MILLISECONDS)/1000)}`],
          ['encryption', 'cc20s10' /*chacha20 stream, 2^10 bytes per chunk*/],
        ],
      }).catch(error => {
        return Promise.reject(`bad event: ${error}`)
      }).then(content_template => {
        const batch = [
          {
            ...content_template
          }, {
            kind: 24, content: `${hex(cryption_key)}`,
            tags: [['e', `${content_template.id}`]],
          }, {
            kind: 555,
            tags: [['IOU','1','sat','POST /publish'], ['p',`${satoshi_hpub}`]],
          }
        ]
        console.log(batch)
        return sign(v.hpub, batch)
      }).then(([note, key, auth]) => {
        console.log(`note: ${JSON.stringify(note)}`)
        console.log(`key: ${JSON.stringify(key)}`)
        console.log(`auth: ${JSON.stringify(auth)}`)
        return Promise.resolve([note, key, auth])
      }).catch(error => {
        if (error.endsWith(': user canceled')) {
          console.log(error)
          return new Promise(()=>{}) // terminate the chain
        } else {
          return Promise.reject(`error while signing: ${error}`)
        }
      }).then(([note, key, auth]) => {
        pendingNote = note
        let req = auth.tags.filter(t => t[0] == 'IOU')[0][3]
        let method = req.split(' ')[0]
        let route = req.substring(method.length).trim()
        console.log(`${method} ${route}`)
        return fetch(`${bapi_baseurl}${route}`, {
          method: `${method}`,
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `SatoshiDNC ${JSON.stringify(auth)}`,
          },
          body: JSON.stringify({
            note,
            key,
          }),
        }).catch(error => Promise.reject(`failed to fetch: ${error}`)).then(response => {
          if (response.ok) {
            return Promise.resolve(response.json())
          } else {
            return new Promise((resolve, reject) => {
              response.json().then(json => reject(json.message))
            })
          }
        }).catch(error => Promise.reject(`request failed: ${error}`)).then(json => {
          console.log(json)
          if (json.message == 'done') {
            return Promise.resolve()
          } else {
            return Promise.reject(json.message)
          }
        }).catch(error => Promise.reject(`error: ${error}`))
      }).catch(error => {
        let m = `publish failed: ${error}`
        console.error(m)
        alert(m)
        return new Promise(()=>{}) // terminate the chain
      }).then(() => {
        console.log('Published. (so we believe)')
        console.log(pendingNote)
        aggregateEvent(pendingNote).then(() => {
          v.closeGad.clickFunc()
        })
        // console.log('sending...')
        // const name = 'relay.satoshidnc.com'
        // homeRelay().then(relay => {
        //   let sent = false
        //   try {
        //     relay.sendEvent(event)
        //     sent = true
        //   } catch (reason) {
        //     alert(`send to ${relay.url} failed: ${reason}`)
        //   }
        //   if (sent) {
        //     v.closeGad.clickFunc()
        //   }
        // }, reason => {
        //   alert(`connect to ${name} failed: ${reason}`)
        // })
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
        }, 5 * 1000)

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
          const blob = new Blob(['testing'], { type: 'text/plain' }) // new Blob(chunks, { type: "audio/ogg; codecs=opus" })
          // const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" })
          const audioURL = URL.createObjectURL(blob)
          audio.src = audioURL
          let tracks = stream.getTracks()
          tracks.forEach(track => track.stop())          
          console.log("recorder stopped", audioURL)

          const TAG = 'aud'
          //const key = 'ff01020304050607080910111213141516171819202122232425262728293031'+'323334353637383940414243'
          const key = '0000000000000000000000000000000000000000000000000000000000000000'+'000000000000000000000000'
          encrypt(key, blob.stream()).then(stream => /*decrypt(key, stream).then(stream =>*/ {
            // console.log(`[${TAG}] got stream`)
            const reader = stream.getReader()
            const readFunc = () => {
              // console.log(`[${TAG}] read`)
              reader.read().then(({ done, value }) => {
                if (value) {
                  console.log(`[${TAG}] ${value}`)
                  readFunc()
                } else if (done) {
                  console.log(`[${TAG}] done`)
                } else {
                  console.log(`[${TAG}] invalid data`)
                }
              }, reason => {
                console.log(`[${TAG}] read error: ${reason}`)
              })
            }
            readFunc()
          })//)

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
v.setContext = function(hpub) {
  const v = this
  v.hpub = hpub
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
    if (g.renderFunc) {
      g.renderFunc()
    } else if (g.label) {
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

  const goal = v.selectorOpen? 1: 0
  if (v.selectorAnimValue != goal) {
    v.selectorAnimValue = v.selectorAnimValue * 0.7 + goal * 0.3
    if (Math.abs(goal - v.selectorAnimValue) < 0.005) {
      v.selectorAnimValue = goal
    }
    setTimeout(() => { v.setRenderFlag(true) })
  }
  const f1 = v.selectorAnimValue
  const f0 = 1 - f1

  if (f1) {
    const items = keys.filter(k=>k.hpub != v.hpub)
    items.push({ option: 'nsec', optionLabel: 'Nostor secret key...' })
    const itemHeight = v.micSendGad.h
    const itemCount = items.length // keys.length - ((keys.map(k=>k.hpub).includes(v.hpub))?1:0) + 1
    const itemIndex = Math.floor((v.sh-168 - v.selectorY)/itemHeight)
    v.selectorItem = items[itemIndex]
    const x = v.sw/2, y = v.sh-168, w = v.sw - x, h = itemHeight
    const s = 29/14
    drawRect(v, alpha(colors.black, 0.70), x, y - f1*itemHeight*itemCount, w, f1*itemHeight*itemCount)
    if (itemIndex >= 0 && itemIndex < itemCount) {
      drawRect(v, colors.inactiveDark, x, y - f1*itemHeight*(itemIndex+1), w, f1*itemHeight)
    }
    for (let i = 0; i<itemCount; i++) {
      if (items[i].hpub && !items[i].option) {
        drawAvatar(v, items[i].hpub, x + h*0.2, y - f1*itemHeight*(i+1) + h*0.1, h*0.8, f1*h*0.8)
      }
      let t = items[i].optionLabel || getPersonalData(items[i].hpub, 'name') || ''
      const max = (w - (items[i].option?0:h) - h*0.4) / s
      if (defaultFont.calcWidth(t) > max) {
        while (defaultFont.calcWidth(t+'...') > max && t.length > 0) {
          t = t.substring(0, t.length-1)
        }
        t = t+'...'
      }
      mat4.identity(m)
      mat4.translate(m, m, [x+h*((items[i].option?0:1) + 0.2), y-f1*(itemHeight*(i+1)-h/2), 0])
      mat4.scale(m, m, [s, s, 1])
      defaultFont.draw(0,7, t, alpha(colors.white, f1), v.mat, m)
    }
  }

}
