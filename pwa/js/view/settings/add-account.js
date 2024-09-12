import { drawRect, drawPill, drawRoundedRect, alpha, blend } from '../../draw.js'
import { trezorConnect, trezorPing, trezorRestore, trezorGetNostrPubKey, trezorGetPassword, trezorSign, trezorWipe } from '../../trezor.js'
import * as bjs from 'bitcoinjs-lib'
import bm from 'bitcoinjs-message'
import * as ecc from '@bitcoinerlab/secp256k1'
import * as bip32f from 'bip32'
//import { Buffer } from 'buffer'
import { serializeEvent, finalizeEvent, verifyEvent, getPublicKey } from 'nostr-tools'

import * as nip19 from 'nostr-tools/nip19'
import { Buffer } from 'buffer'

/* secret key should not leave this file */
const my_hsec = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex')
function hsec() { return my_hsec }
function bsec() { return Buffer.from(hsec(), 'hex') }
function nsec() { return nip19.nsecEncode(bsec()) }

export function hpub() { return getPublicKey(bsec()) }
export function bpub() { return Buffer.from(hpub(), 'hex') }
export function npub() { return nip19.npubEncode(hpub()) }

const TITLE_TOP = 120
const ITEM_TOP = TITLE_TOP + 61
const ITEM_LEFT = 90
const ITEM_SIZE = 179
const BOT_SPACE = 203

const ENTER_SEED = 'ENTER_SEED'
const GEN_HPUB = 'GEN_HPUB'
const GEN_PW = 'GEN_PW'
const SIGN_MSG = 'SIGN_MSG'
const WIPE_SEED = 'WIPE_SEED'

let v, g
export const menuView = v = new fg.View(null)
v.name = Object.keys({menuView}).pop()
v.designSize = 1080*2183
v.bgColor = [0x12/0xff, 0x1b/0xff, 0x22/0xff, 1]
v.textColor = [0xf7/0xff, 0xf8/0xff, 0xfa/0xff, 1]
v.flashAnim = 0
v.invoker = function(item, parentRoot) {
  const v = this
  const openTrezorPanel = () => {
    if (fg.getRoot() !== menuRoot || menuRoot.easingState() == -1) {
      menuRoot.easeIn?.()
    } else {
      menuRoot.easeOut?.()
    }
  }
  trezorConnect().then(() => {
    if (fg.getRoot() === parentRoot) {
      parentRoot.followUp = openTrezorPanel
    } else {
      openTrezorPanel()
    }
  }).catch(e => {
    console.warn(e)
  })
}
v.easingState = 1
v.easingValue = 0
v.easingRate = 0.033
v.items = [
  { key: ENTER_SEED, copyAnim: 0, name: 'Enter seed words on Trezor'},
  { key: GEN_HPUB,   copyAnim: 0, name: 'Select Nostor public key'},
  { key: GEN_PW,     copyAnim: 0, name: 'Select password'},
  { key: SIGN_MSG,   copyAnim: 0, name: 'Sign message'},
  { key: WIPE_SEED,  copyAnim: 0, name: 'Wipe seed from Trezor'},
]
v.menuX = 0
v.menuR = 32
v.getText = (mime) => {
  return new Promise((resolve, reject) => {
    navigator.clipboard.read().then(items => {
      if (items.length == 1) {
        const item = items[0]
        if (item.types.includes(mime)) {
          item.getType(mime).then(blob => blob.text()).then(text => {
            resolve(text)
          })
        } else {
          reject(`To sign what is in the clipboard, the clipboard must contain ${mime}.`)
        }
      } else {
        reject(`To sign what is in the clipboard, the clipboard must contain only one item.`)
      }
    })  
  })
}
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

        case ENTER_SEED:
          trezorRestore().then(handleResult).catch(handleError)
          break

        case GEN_HPUB:
          {
            if (item.hpub) {
              navigator.clipboard.writeText(item.hpub)
              item.hpub = undefined
              item.subtitle = undefined
              clearSelection()
              break
            }

            let a, n = -1
            while (!(n >= 0 && n < 2 ** 31)) {
              a = prompt("Account number (0 and up):")
              if (a === null) break
              n = +a
            }
            if (a === null) {
              clearSelection()
              break
            }
            trezorGetNostrPubKey(n).then(r => {
              const bip32 = bip32f.BIP32Factory(ecc)
              const { address } = bjs.payments.p2pkh({
                pubkey: bip32.fromBase58(r.xpub).publicKey,
              })
              clearSelection()
              item.hpub = nip19.npubEncode(r.nodeType.publicKey.slice(1).map(e => (e<15?'0':'')+e.toString(16)).join(''))
              item.subtitle = item.hpub
              v.setRenderFlag(true)
              // menuRoot.followUp = () => {
              //   newContactForm.nameGad.text = ''
              //   newContactForm.pubkeyGad.text = r.nodeType.publicKey.slice(1).map(e => (e<15?'0':'')+e.toString(16)).join('')
              //   fg.getRoot().easeOut(g.newContactRoot)
              // }
              // menuRoot.easeOut()
            }).catch(handleError)
            }
          break

          case GEN_PW:
            {
              if (item.passwd) {
                navigator.clipboard.writeText(item.passwd)
                item.passwd = undefined
                item.subtitle = undefined
                clearSelection()
                break
              }

              const text = prompt('Name of account:')
              if (text === null) {
                clearSelection()
                break
              }
              window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(bytes => {
                const hash = Buffer.from(bytes).toString('hex')
                const index = '' + (parseInt(hash.substring(0,8), 16) & 0x7fffffff)
                trezorGetPassword(index).then(r => {
                  const bip32 = bip32f.BIP32Factory(ecc)
                  const { address } = bjs.payments.p2pkh({
                    pubkey: bip32.fromBase58(r.xpub).publicKey,
                  })
                  clearSelection()
                  item.passwd = btoa(String.fromCharCode(...new Uint8Array(r.nodeType.publicKey)))
                  item.subtitle = '********************************************'
                  v.setRenderFlag(true)
                }).catch(handleError)    
              })
            }
            break
  
          case SIGN_MSG:
          const sk = hsec()
          const pk = hpub()
          const testEvent = {
            kind: 1,
            created_at: Math.floor(Date.now() / 1000),
            content: 'test',
            tags: [
              ['z', 'test'],
            ],
            pubkey: `4e820be97ea4c87fba065db7cd3ad731f3e3d45811663f477aaab08c403da156`,
          }
          console.log('testEvent:', testEvent)
          const serEvent = serializeEvent(JSON.parse(JSON.stringify(testEvent)))
          console.log('serEvent:', serEvent)
          const signedEvent = finalizeEvent(JSON.parse(JSON.stringify(testEvent)), sk)
          console.log('nostr-tools signedEvent:', signedEvent)
          console.log('nostr-tools verifyEvent() returns:', verifyEvent(JSON.parse(JSON.stringify(signedEvent))))
          // const bmsig = bm.sign(serEvent)
          window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(serEvent)).then(h => {
            const hash = Array.prototype.map.call(new Uint8Array(h), n => n.toString(16).padStart(2, "0")).join("")
            console.log('hash:', hash)
            trezorSign(0, hash).then(r => {
              console.log('trezor returns:', r)
              if (!r.sig) {
                clearSelection()
                return
              }
              const trezorSig = Buffer.from(r.sig).toString('hex')
              console.log('trezorSig:', trezorSig)
              console.log('bitcoin-message verify() returns:', bm.verify(hash, r.address, Buffer.from(r.sig)))
              const trezorEvent = JSON.parse(JSON.stringify(testEvent))
              trezorEvent.id = hash
              trezorEvent.sig = trezorSig
              console.log('trezorEvent:', trezorEvent)
              console.log('nostr-tools verifyEvent() returns:', verifyEvent(JSON.parse(JSON.stringify(trezorEvent))))
              clearSelection()
            }).catch(handleError)
          })
          break

        case WIPE_SEED:
          trezorWipe().then(handleResult).catch(handleError)
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
  let str = 'Trezor tools'
  let s = 41/14
  mat4.translate(m,m, [v.menuX + (v.menuW - defaultFont.calcWidth(str) * s) / 2, v.menuY + TITLE_TOP + 41 + v.menuH * f0, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, str, v.textColor, v.mat, m)

  let i = 0
  for (const item of v.items) {
    if (item.name == v.items?.[v.index]?.name) {
      drawRect(v, colors.inactiveDark, v.menuX, v.menuY + ITEM_TOP + 79 + 35 / 2 - ITEM_SIZE / 2 + ITEM_SIZE * i + v.menuH * f0, v.menuW, ITEM_SIZE)
      mat4.identity(m)
      mat4.translate(m,m, [v.menuX + v.menuW - 190, v.menuY + ITEM_TOP + 79 + i * ITEM_SIZE + 35 + v.menuH * f0, 0])
      mat4.scale(m,m, [35/14, 35/14, 1])
      iconFont.draw(0,0, 'T', blend(v.textColor, colors.inactiveDark, (Math.cos(v.flashAnim*2*Math.PI)+1)/2), v.mat, m)
      v.flashAnim += 0.02
      if (v.flashAnim >= 1) {
        v.flashAnim -= 1
      }
      v.setRenderFlag(true)
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
