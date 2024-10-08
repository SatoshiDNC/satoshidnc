import { drawRect, drawPill, drawRoundedRect, alpha, blend } from '../../draw.js'
import { trezorConnect, trezorPing, trezorRestore, trezorGetNostrPubKey, trezorGetPassword, trezorSign, trezorWipe } from '../../trezor.js'
import { contentView as newContactForm } from './new-chat/new-contact/content.js'
import * as bjs from 'bitcoinjs-lib'
import bm from 'bitcoinjs-message'
import * as ecc from '@bitcoinerlab/secp256k1'
import * as bip32f from 'bip32'
//import { Buffer } from 'buffer'
import { serializeEvent, finalizeEvent, verifyEvent, getPublicKey } from 'nostr-tools'

import { bech32_noteId as noteId, relayUrl, findEvent, npub } from '../../nostor.js'
import { relays } from '../../relays.js'

// import * as nip19 from 'nostr-tools/nip19'
// import { Buffer } from 'buffer'
// import { getKeyInfo, addTrezorKey } from '../../keys.js'
// import { getPersonalData, setPersonalData } from '../../personal.js'

// /* secret key should not leave this file */
// const my_hsec = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex')
// function hsec() { return my_hsec }
// function bsec() { return Buffer.from(hsec(), 'hex') }
// function nsec() { return nip19.nsecEncode(bsec()) }

// export function hpub() { return getPublicKey(bsec()) }
// export function bpub() { return Buffer.from(hpub(), 'hex') }
// export function npub() { return nip19.npubEncode(hpub()) }

const TITLE_TOP = 120
const ITEM_TOP = TITLE_TOP + 61
const ITEM_LEFT = 90
const ITEM_SIZE = 179
const BOT_SPACE = 203

const DEL_EVENT = 'DEL_EVENT'

let v, g
export const menuView = v = new fg.View(null)
v.name = Object.keys({menuView}).pop()
v.designSize = 1080*2183
v.bgColor = [0x12/0xff, 0x1b/0xff, 0x22/0xff, 1]
v.textColor = [0xf7/0xff, 0xf8/0xff, 0xfa/0xff, 1]
v.flashAnim = 0
v.invoker = function(item, parentRoot) {
  const v = this
  const openNostorPanel = () => {
    if (fg.getRoot() !== menuRoot || menuRoot.easingState() == -1) {
      menuRoot.easeIn?.()
    } else {
      menuRoot.easeOut?.()
    }
  }
  setTimeout(() => {
    openNostorPanel()
  })
}
v.easingState = 1
v.easingValue = 0
v.easingRate = 0.033
v.items = [
  { key: DEL_EVENT, copyAnim: 0, name: 'Delete an event'},
]
v.menuX = 0
v.menuR = 32
v.gadgets.push(g = v.closeGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 69, g.h = 104
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    menuRoot.easeOut()
  }
v.gadgets.push(g = v.menuGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    const x = e.x / v.viewScale - v.menuX, y = e.y / v.viewScale - v.menuY
    const index = Math.floor((y - ITEM_TOP - 79 - 35 / 2 + ITEM_SIZE / 2) / ITEM_SIZE)
    if (index >= 0 && index < v.items.length) {
      v.index = index
      v.setRenderFlag(true)
      v.flashAnim = 0
      const clearSelection = () => {
        if (v.index == index) {
          v.index = -1
          v.setRenderFlag(true)
        }
      }
      const handleResult = result => {
        console.log('menu handleResult', result)
        clearSelection()
        if (result.message != 'Cancelled') {
          alert(result.message || result.xpub || result.address)
        }
      }
      const handleError = e => {
        alert(e)
        clearSelection()
      }
      const item = v.items[v.index]
      switch (item.key) {

        case DEL_EVENT:
          setTimeout(() => {

            let entry = prompt(`Event id:`)
            if (!entry) {
              clearSelection()
              return
            }

            let id = (noteId(entry) || entry)?.toLowerCase()
            if (id?.length !== 64 || !id?.split('').reduce((a, c) => a && '0123456789abcdef'.includes(c), true)) {
              if (id?.trim()) alert(`Invalid event id`)
              clearSelection()
              return
            }

            let hits = 0, allRelays = [ ...relays.map(relay => relay.url) ]
            let pubkeys = []
            let checksInProgress = []
            const queryRelayForNote = relay => {
              console.log('checking relay', relay)
              checksInProgress.push(findEvent(id, relay))
            }
            const waitForResults = () => {
              Promise.allSettled(checksInProgress).then(results => {
                hits += results.reduce((a, c) => {
                  let pk = c.value?.pubkey
                  if (pk && !pubkeys.includes(pk)) {
                    pubkeys.push(pk)
                  }
                  return c.status == 'fulfilled'? a + 1 : a
                }, 0)
                checksInProgress = []
                let input = prompt(`Found ${
                  pubkeys.length
                } event on ${hits} of ${allRelays.length} relays. Owned by ${
                  pubkeys.map(hpub => {
                    let np = npub(hpub)
                    return `${hpub.substring(0,4)}···${hpub.substring(hpub.length-4)} / ${np.substring(0,9)}···${np.substring(np.length-4)}`
                  }).join(', ')
                }. Enter additional relay(s) or continue:`)
                if (!input) {
                  finish()
                } else {
                  input.split(',').map(element => {
                    let relay = relayUrl(element)
                    if (!relay) {
                      // alert(`Invalid relay name or url`)
                    } else if (allRelays.includes(relay)) {
                      // alert(`Relay was already checked`)
                    } else {
                      allRelays.push(relay)
                      queryRelayForNote(relay)
                      waitForResults()
                    }
                  })
                }
              })
            }
            relays.map(queryRelayForNote)
            waitForResults()
            const finish = () => {
              console.log(DEL_EVENT, id, allRelays)
              clearSelection()
            }

          }, 100)
          break

      }
      // v.items[index].handler(v.items[index])
      // menuRoot.easeOut()
    } else {
      // console.log('menu', x, y, index)
    }
  }
v.gadgets.push(g = v.screenGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function() {
    menuRoot.easeOut()
  }
v.prepMenu = function(items) {
  const v = this
  v.items = items||v.items
  v.index = -1
  v.currentItemCount = v.items.length
}
v.layoutFunc = function() {
  const v = this
  v.menuH = ITEM_TOP + ITEM_SIZE * v.currentItemCount + BOT_SPACE
  v.menuY = v.sh - v.menuH
  v.menuW = v.sw
  let g
  g = v.closeGad
  g.y = v.sh - 147
  g.w = v.sw - 2 * g.x
  g.autoHull()
  g = v.menuGad
  g.x = v.menuX
  g.y = v.menuY
  g.w = v.menuW
  g.h = v.menuH
  g.autoHull()
  g = v.screenGad
  g.x = 0
  g.y = 0
  g.w = v.sw
  g.h = v.sh
  g.autoHull()
}
v.renderFunc = function() {
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
        menuRoot.out()
        if (menuRoot.followUp) {
          setTimeout(menuRoot.followUp)
          menuRoot.followUp = undefined
        }
      }
    }
    menuRoot.ghostOpacity = v.easingValue * 0.5
    v.setRenderFlag(true)
  }
  const f1 = v.easingValue
  const f0 = 1 - f1
  const m = mat4.create()
  const mat = mat4.create()

  drawRoundedRect(v, v.bgColor, 75, v.menuX, v.menuY + v.menuH * f0, v.menuW, v.menuH + 75)
  drawPill(v, colors.inactive, v.menuX + (v.menuW - 84) / 2, v.menuY + 26 + v.menuH * f0, 84, 11)

  mat4.identity(m)
  let str = 'Nostor tools'
  let s = 41/14
  mat4.translate(m,m, [v.menuX + (v.menuW - defaultFont.calcWidth(str) * s) / 2, v.menuY + TITLE_TOP + 41 + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, str, v.textColor, v.mat, m)

  let i = 0
  for (const item of v.items) {
    if (item.name == v.items?.[v.index]?.name) {
      drawRect(v, colors.inactiveDark, v.menuX, v.menuY + ITEM_TOP + 79 + 35 / 2 - ITEM_SIZE / 2 + ITEM_SIZE * i + v.menuH * f0, v.menuW, ITEM_SIZE)
      // mat4.identity(m)
      // mat4.translate(m,m, [v.menuX + v.menuW - 190, v.menuY + ITEM_TOP + 79 + i * ITEM_SIZE + 35 + v.menuH * f0, 0])
      // mat4.scale(m,m, [35/14, 35/14, 1])
      // iconFont.draw(0,0, 'T', blend(v.textColor, colors.inactiveDark, (Math.cos(v.flashAnim*2*Math.PI)+1)/2), v.mat, m)
      // v.flashAnim += 0.02
      // if (v.flashAnim >= 1) {
      //   v.flashAnim -= 1
      // }
      // v.setRenderFlag(true)
    }
    mat4.identity(m)
    mat4.translate(m,m, [v.menuX + ITEM_LEFT, v.menuY + ITEM_TOP + 79 + i * ITEM_SIZE + 35 + v.menuH * f0, 0])
    mat4.scale(m,m, [35/14, 35/14, 1])
    defaultFont.draw(0,0, item.name, v.textColor, v.mat, m)
    let goal
    goal = 0
    if (item.subtitle) {
      goal = 1
      item.subtitleCached = item.subtitle
    }

    if (item.copyAnim != goal) {
      item.copyAnim -= 0.02
      if (item.copyAnim < goal) {
        item.copyAnim = goal
      }
      v.setRenderFlag(true)
    }

    if (item.subtitleCached) {
      mat4.identity(m)
      mat4.translate(m,m, [v.menuX + ITEM_LEFT, v.menuY + ITEM_TOP + 134 + i * ITEM_SIZE + 25 + v.menuH * f0, 0])
      s = 25/14
      mat4.scale(m,m, [s, s, 1])
      const w = v.menuW - ITEM_LEFT - 135
      let str
      if (defaultFont.calcWidth(item.subtitleCached) * s > w) {
        let l = item.subtitleCached.length
        while (defaultFont.calcWidth(item.subtitleCached.substring(0,l)+'...') * s > w) {
          l--
        }
        str = item.subtitleCached.substring(0,l)+'...'
      } else {
        str = item.subtitleCached
      }
      defaultFont.draw(0,0, str, alpha(colors.inactive, item.copyAnim), v.mat, m)
    }

    mat4.identity(m)
    s = 35/18
    mat4.translate(m,m, [v.menuX + v.menuW - 190 + 7*s, v.menuY + ITEM_TOP + 79 + i * ITEM_SIZE + 35 + v.menuH * f0 - 9*s, 0])
    s = 35/18*(1+(1-item.copyAnim))
    mat4.scale(m,m, [s, s, 1])
    iconFont.draw(-7,9, '@', alpha(v.textColor, item.copyAnim), v.mat, m)

    i++
  }

  let g = v.closeGad
  drawPill(v, colors.accent, g.x, g.y + v.menuH * f0, g.w, g.h)
  mat4.identity(m)
  str = 'Close'
  s = 29/14
  mat4.translate(m,m, [g.x + (g.w - defaultFont.calcWidth(str) * s) / 2, g.y + 66 + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, str, v.bgColor, v.mat, m)
}

export const menuRoot = v = new fg.OverlayView(null)
v.name = Object.keys({menuRoot}).pop()
v.a = menuView; menuView.parent = v
v.ghostOpacity = 0
v.easeIn = function(items) {
  const v = this
  menuView.prepMenu(items)
  menuView.easingState = 1
  menuView.easingRate = 0.06
  const r = fg.getRoot()
  if (r !== v) {
    v.b = r; r.parent = v
    v.ghostView = r
    fg.setRoot(v)
  }
}
v.easeOut = function() {
  const v = this
  menuView.easingState = -1
  menuView.easingRate = 0.1
  v.setRenderFlag(true)
}
v.easingState = function() {
  return menuView.easingState
}
v.out = function() {
  const v = this
  fg.setRoot(v.ghostView)
}
