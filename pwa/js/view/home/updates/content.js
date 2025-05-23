import { drawPill, drawAvatar, drawEllipse, drawRect, blend, hue } from '../../../draw.js'
import { getName } from '../../../personal.js'
import { addedOn, updatePostedAsOf } from '../../util.js'
import { aggregateEvent, savePendingReactions, setDummyKey, getUpdates, eventTrigger } from '../../../content.js'
import { followChannel, unfollowChannel, amFollowingChannel, followsTrigger, follows as channelFollows } from '../../../channels.js'
import { rootView as displayView } from './display/root.js'
import { rootView as channelView } from './channel/root.js'
import { barBot } from '../bar-bot.js'
import { signBatch as sign, defaultKey, keys } from '../../../keys.js'
import { balances, balanceTrigger } from '../../../deals.js'

const touchRadius = 85, clickRadius = 5;
const getPointerRadius = function() { return (navigator.maxTouchPoints>0 ? touchRadius : clickRadius); }

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.splashMode = 0
v.frameTimes = []
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.textColor = [1,1,1,1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.subtitleColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
balanceTrigger.push(() => { v.setRenderFlag(true) })
followsTrigger.push(() => { v.queueLayout() })
v.displayAction = function(updates, hpub, returnView, root, target, mode) {
  const v = this

  let targetView
  if (mode == 1) {
    targetView = channelView
  } else {
    targetView = displayView
  }

  // prepare everything to sign in exchange for decryption key
  let new_count = 0
  let to_sign = []
  let keys_owed = []
  let total_cost = 0
  for (const u of updates) if (u.hpub == hpub && u.data.tags.filter(t=>t[0]=='encryption').length>0 && !u.viewed && !u.data._key) {
    new_count += 1
    const pending_reaction = {
      kind: 7,
      content: '👀',
      tags: [['e',`${u.data.id}`], ['p',`${u.hpub}`], ['k',`${u.data.kind}`]],
    }
    pending_reactions.push(pending_reaction)
    to_sign.push(pending_reaction)
    keys_owed.push(u.data.id)
    total_cost += Math.max(1 /* enforce non-zero cost (at all costs, lol) */, +(u.data.tags.filter(t => t[0] == 'c')?.[0]?.[1] || '0'))
  }
  if (new_count == 0 && total_cost == 0) {
    targetView.setContext(updates, hpub, returnView)
    root.easeOut(target)
    return
  }
  if (new_count <= 0) {
    console.log('unexpected: no updates')
    return
  }
  if (total_cost <= 0) {
    console.log('unexpected: no cost')
    return
  }
  to_sign.unshift({
    kind: 555,
    tags: [['IOU',`${total_cost}`,'sat',`updates`], ...keys_owed.map(id => ['UOI','1','x',`e ${id} key`]), ['IOU',`${new_count}`,'x',`reaction`,``,`${new_count}`,'sat'], ['p',`${hpub}`]],
  })
  to_sign.unshift({
    kind: 555,
    tags: [['IOU','1','sat',`POST /unlock?id=${keys_owed.join(',')}`], ['p',`${satoshi_hpub}`]],
  })

  // sign everything at once
  sign(defaultKey, to_sign).then(([auth, deal, ...checkmarks]) => {
    console.log(`auth: ${JSON.stringify(auth)}`)
    console.log(`deal: ${JSON.stringify(deal)}`)
    console.log(`reactions: ${JSON.stringify(checkmarks)}`)
    return Promise.resolve([auth, deal, ...checkmarks])
  }).catch(error => {
    if (error.endsWith?.(': user canceled')) {
      console.log(error)
      return new Promise(()=>{}) // terminate the chain
    } else {
      return Promise.reject(`error while signing: ${error}`)
    }
  }).then(([auth, deal, ...reactions]) => {

    // save the reactions for later
    pending_reactions.push(...reactions)
    savePendingReactions(reactions)

    // fetch the decryption key(s)
    let req = auth.tags.filter(t => t[0] == 'IOU')[0][3]
    let method = req.split(' ')[0]
    let route = req.substring(method.length).trim()
    return fetch(`${bapi_baseurl}${route}`, {
      method: `${method}`,
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `SatoshiDNC ${JSON.stringify(auth)}`,
      },
      body: JSON.stringify(deal)
    }).catch(error => Promise.reject(`failed to fetch: ${error}`)).then(response => {
      if (response.ok) {
        return Promise.resolve(response.json())
      } else {
        return new Promise((resolve, reject) => {
          response.json().then(json => reject(json.message))
        })
      }
    }).catch(error => Promise.reject(`request failed: ${error}`)).then(json => {
      if (json.message == 'done') {
        return Promise.resolve(json.results)
      } else {
        return Promise.reject(json.message)
      }
    }).catch(error => Promise.reject(`error: ${error}`))
  }).catch(error => {
    let m = `view failed: ${error}`
    console.error(m)
    alert(m)
    return new Promise(()=>{}) // terminate the chain
  }).then(json => {

    // process the decryption key(s)
    console.log('processing', json)
    json.map(r => {
      if (r[1] == 'ok') {
        r[2].tags.filter(t => t[0] == 'e').map(t => t[1]).map(id => {
          updates.filter(u => u.data.id == id).map(u => {
            u.data._key = r[2].content
          })
        })
        aggregateEvent(r[2])
      } else if (r[1] == 'unavailable') {
        updates.filter(u => u.data.id == r[0]).map(u => {
          u.data._key = '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
          setDummyKey(r[0])
        })
      }
    })
    targetView.setContext(updates, hpub, returnView)
    root.easeOut(target)
  })
}
v.gadgets.push(g = v.selfsGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    const y = (e.y - v.y) / v.viewScale + v.userY
    const index = Math.floor((y - g.y) / 200)
    if (index < 0 || index >= v.selfs.length) return
    const updates = v.query.results.filter(u => v.selfs.includes(u.hpub))
    if (updates.filter(u => u.hpub == v.selfs[index]).length == 0) {
      g.target2.setContext(v.selfs[index])
      g.root.easeOut(g.target2)
    } else {
      v.displayAction(updates, v.selfs[index], v.parent.parent, g.root, g.target)
    }
  }
v.gadgets.push(g = v.recentsGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    const y = (e.y - v.y) / v.viewScale + v.userY
    const index = Math.floor((y - g.y) / 200)
    if (index < 0 || index >= v.recents.length) return
    const updates = v.query.results.filter(u => v.recents.includes(u.hpub))
    v.displayAction(updates, v.recents[index], v.parent.parent, g.root, g.target)
  }
v.gadgets.push(g = v.viewedGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    const y = (e.y - v.y) / v.viewScale + v.userY
    const index = Math.floor((y - g.y) / 200)
    if (index < 0 || index >= v.viewed.length) return
    const updates = v.query.results.filter(u => u.hpub == v.viewed[index])
    v.displayAction(updates, v.viewed[index], v.parent.parent, g.root, g.target)
  }
v.gadgets.push(g = v.channelsGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    const y = (e.y - v.y) / v.viewScale + v.userY
    const index = Math.floor((y - g.y) / 200)
    if (index < 0 || index >= v.channels.length) return
    const updates = v.query.results.filter(u => u.hpub == v.channels[index])
    v.displayAction(updates, v.channels[index], v.parent.parent, g.root, g.target, 1)
  }
v.gadgets.push(g = v.discoverGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    const y = (e.y - v.y) / v.viewScale + v.userY
    const index = Math.floor((y - g.y) / 200)
    if (index < 0 || index >= v.discover.length) return

    // spontaneous gadget
    const following = amFollowingChannel(v.discover[index])
    let followGad = new fg.Gadget(v)
    followGad.w = following?263:208
    followGad.x = v.sw-42-followGad.w
    followGad.y = g.y+index*200+53
    followGad.h = 83
    followGad.autoHull()

    // check for gadget click (a bit kludgey, but it handles the touch radius nicely)
    const hitList = { x: e.x, y: e.y, hits: [] }
    followGad.getHits(hitList, getPointerRadius())
    if (hitList.hits.map(h => h.gad).includes(followGad)) {
      if (!following) {
        followChannel(v.discover[index])
      } else {
        unfollowChannel(v.discover[index])
      }
      return
    }

    // default case: view the channel
    const updates = v.query.results.filter(u => u.hpub == v.discover[index])
    v.displayAction(updates, v.discover[index], v.parent.parent, g.root, g.target, 1)
  }
v.gadgets.push(g = v.exploreGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 37
  g.w = 362, g.h = 104
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    console.log('explore')
  }
v.gadgets.push(g = v.swipeGad = new fg.SwipeGadget(v))
  g.actionFlags = fg.GAF_SWIPEABLE_UPDOWN|fg.GAF_SCROLLABLE_UPDOWN
v.clearQuery = function() {
  const v = this
  v.query = { inProgress: false, lastCompleted: 0, results: [] }
}
v.clearQuery()
v.queryFunc = function() {
  const v = this
  const ONE_SECOND_IN_MILLISECONDS = 1 * 1000
  const now = Date.now()
  if (v.query.timer) {
    clearTimeout(v.query.timer)
    v.query.timer = undefined
  }
  if (v.query.inProgress) {
    v.query.timer = setTimeout(() => {
      // console.log('delayed query (was in progress)')
      v.query.timer = undefined
      v.queryFunc()
    }, ONE_SECOND_IN_MILLISECONDS)
  } else {
    if (v.query.lastCompleted < now - ONE_SECOND_IN_MILLISECONDS) {
      v.query.inProgress = true
      getUpdates().then(updates => {
        v.query.inProgress = false
        v.query.lastCompleted = Date.now()
        v.query.results = updates
        v.relayout()
      })
    } else {
      // console.log('delayed query (was recent)')
      v.query.timer = setTimeout(() => {
        v.query.timer = undefined
        v.queryFunc()
      }, Math.max(0, v.query.lastCompleted - now + ONE_SECOND_IN_MILLISECONDS))
    }
  }

}
v.layoutFunc = function() {
  const v = this

  const recents = []
  const viewed = []
  const channels = [...channelFollows]
  const discover = []
  for (const update of v.query.results) {
    if (update.data.tags.filter(t => t[0] == 'expiration').length == 0 || update.data.kind == 30023) { // channel
      // if (keys.filter(k => k.hpub == update.hpub).length == 0) {
      //   if (!channels.includes(update.hpub)) {
      //     channels.push(update.hpub)
      //   }
      // }
    }
    if (update.data.tags.filter(t => t[0] == 'expiration').length > 0 && ![30023].includes(update.data.kind)) { // status
      if (keys.filter(k => k.hpub == update.hpub).length == 0) {
        if (!update.viewed) {
          if (!recents.includes(update.hpub)) {
            recents.push(update.hpub)
            const index = viewed.indexOf(update.hpub)
            if (index > -1) {
              viewed.splice(index, 1)
            }
          }
        } else {
          if (!recents.includes(update.hpub) && !viewed.includes(update.hpub)) {
            viewed.push(update.hpub)
          }
        }
      }
    }
  }
  discover.push('51c63606c483dc9b44373e8ea240494b8101e4b23da579f17fec195029207e99') // Satoshi, D.N.C.
  discover.push('d98a11b4be2839cd9d4495e163852aa037e3cdafdd1e6ce730307d0d05f468c3') // Daily Bible
  discover.push('fd3db6deffb739f806026e81d1c8d99cc245a3f386acbbaba8dc983710c7e81a') // Bitcoin Paraguay

  v.keys = keys.map(k => k.hpub)
  v.selfs = [ defaultKey ]
  v.recents = recents
  v.viewed = viewed
  v.channels = channels
  v.discover = discover

  let x = 0
  let g
  g = v.selfsGad
  g.x = x, g.y = 170
  g.w = v.sw, g.h = v.selfs.length * 200
  g.autoHull()
  g = v.recentsGad
  g.x = x, g.y = v.selfsGad.y + v.selfsGad.h + ((recents.length > 0) ? 96 : 0)
  g.w = v.sw, g.h = recents.length * 200
  g.autoHull()
  g = v.viewedGad
  g.x = x, g.y = v.recentsGad.y + v.recentsGad.h + ((viewed.length > 0) ? 96 : 0)
  g.w = v.sw, g.h = viewed.length * 200
  g.autoHull()
  g = v.channelsGad
  g.x = x, g.y = v.viewedGad.y + v.viewedGad.h + 136
  g.w = v.sw, g.h = channels.length * 200
  g.autoHull()
  g = v.discoverGad
  g.x = x, g.y = v.channelsGad.y + v.channelsGad.h + ((channels.length > 0) ? 93 : 246)
  g.w = v.sw, g.h = discover.length * 200
  g.autoHull()
  g = v.exploreGad
  g.y = v.discoverGad.y + v.discoverGad.h + ((discover.length > 0) ? 12 : 12)
  g.autoHull()

  v.minX = 0, v.maxX = v.sw
  v.minY = 0, v.maxY = v.exploreGad.y + v.exploreGad.h + 346

  g = v.swipeGad
  g.layout.call(g)
}
eventTrigger.push(() => {
  v.queryFunc()
})
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)  
  const m = mat4.create()
  const mat = mat4.create()

  // turn off the notification dot on the bottom bar
  barBot.paneGads.filter(g => g.label == 'Updates')[0].new = false

  // title
  mat4.identity(m)
  mat4.translate(m, m, [45, 125, 0])
  mat4.scale(m, m, [41/14, 41/14, 1])
  let x = 0, y = 0
  defaultFont.draw(x,y, 'Status', v.textColor, v.mat, m)

  // title
  if (v.recents.length > 0) {
    mat4.identity(m)
    mat4.translate(m, m, [45, v.recentsGad.y-32 /*434*/, 0])
    mat4.scale(m, m, [28/14, 28/14, 1])
    defaultFont.draw(x,y, 'Recent updates', v.subtitleColor, v.mat, m)
  }

  // title
  if (v.viewed.length > 0) {
    mat4.identity(m)
    mat4.translate(m, m, [45, v.viewedGad.y-32 /*434 + (v.recents.length>0 ? v.recents.length * 200 + 98 : 0)*/, 0])
    mat4.scale(m, m, [28/14, 28/14, 1])
    defaultFont.draw(x,y, 'Viewed updates', v.subtitleColor, v.mat, m)
  }

  // title
  mat4.identity(m)
  mat4.translate(m, m, [45, v.channelsGad.y-43, 0])
  mat4.scale(m, m, [42/14, 42/14, 1])
  defaultFont.draw(x,y, 'Channels', v.titleColor, v.mat, m)

  // channel tip
  if (v.channels.length == 0) {
    mat4.identity(m)
    mat4.translate(m, m, [45, v.channelsGad.y-43+70, 0])
    mat4.scale(m, m, [28/14, 28/14, 1])
    defaultFont.draw(x,y, 'Stay updated on topics that matter to you.', v.subtitleColor, v.mat, m)
    mat4.identity(m)
    mat4.translate(m, m, [45, v.channelsGad.y-43+128, 0])
    mat4.scale(m, m, [28/14, 28/14, 1])
    defaultFont.draw(x,y, 'Find channels to follow below.', v.subtitleColor, v.mat, m)
  }

  // title
  mat4.identity(m)
  mat4.translate(m, m, [45, v.discoverGad.y-22, 0])
  mat4.scale(m, m, [28/14, 28/14, 1])
  defaultFont.draw(x,y, 'Find channels to follow', v.subtitleColor, v.mat, m)

  // all public keys with updates
  let i = 0
  for (let hpub of [...v.selfs, ...v.recents, ...v.viewed, ...v.channels, ...v.discover]) {

    // parameters
    const numUpdates = v.query.results.filter(u => u.hpub == hpub).length
    const newest = v.query.results.filter(u => u.hpub == hpub).reduce((a,c) => Math.max(a,c.data.created_at * 1000), 0)
    const numViewed = v.query.results.filter(u => u.hpub == hpub).reduce((a,c) => a+(c.viewed?1:0), 0)
    const numNew = numUpdates - numViewed
    const g =
      i < v.selfs.length? v.selfsGad:
      i < v.selfs.length + v.recents.length? v.recentsGad:
      i < v.selfs.length + v.recents.length + v.viewed.length? v.viewedGad:
      i < v.selfs.length + v.recents.length + v.viewed.length + v.channels.length? v.channelsGad: v.discoverGad
    const index =
      i < v.selfs.length? i:
      i < v.selfs.length + v.recents.length? i - v.selfs.length:
      i < v.selfs.length + v.recents.length + v.viewed.length? i - v.selfs.length - v.recents.length:
      i < v.selfs.length + v.recents.length + v.viewed.length + v.channels.length? i - v.selfs.length - v.recents.length - v.viewed.length:
      i - v.selfs.length - v.recents.length - v.viewed.length - v.channels.length
    const mode = i < v.selfs.length + v.recents.length + v.viewed.length? 'status': 'channels'

    // the updates ring around the avatar
    if (numUpdates && mode == 'status') {
      drawEllipse(v, colors.accent, 32, g.y + 26 + index * 200, 147, 147)
      if (numViewed) {
        drawEllipse(v, colors.inactive, 32, g.y + 26 + index * 200 + 147, 147, -147, numViewed/numUpdates, -numViewed/numUpdates)
      }
      drawEllipse(v, v.bgColor, 38, g.y + 32 + index * 200, 135, 135)
      if (numUpdates > 1) for (let i = 0; i < numUpdates; i++) {
        mainShapes.useProg2()
        gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(v.bgColor))
        gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
        mat4.identity(m)
        mat4.translate(m,m, [105, g.y + 99.5 + index * 200, 0])
        mat4.rotate(m,m, 2*Math.PI*i/numUpdates, [0, 0, 1])
        mat4.translate(m,m, [-3, -74.5, 0])
        mat4.scale(m,m, [6, 8, 1])
        gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
        mainShapes.drawArrays2('rect')
      }
    }

    // the avatar
    if (mode == 'channels') {
      drawAvatar(v, hpub, 42, g.y + 36 + index * 200, 127, 127, v.keys.includes(hpub)?0:balances[hpub]?.['sat']||0)
    } else {
      drawEllipse(v, colors.inactiveDark, 43, g.y + 37 + index * 200, 125, 125)
    }

    let balance = balances[hpub]?.['sat'] || 0
    let rank = balance? `${Math.abs(balance)}`.length: 0
    let rankIcon = balance > 0? '💔': '❤'
    let rankColor = balance > 0? colors.brokenHeart: colors.wholeHeart

    // name / title
    let textScale = 35/14
    let str
    if (v.keys.includes(hpub) && g === v.selfsGad) {
      if (v.selfs.length == 1) {
        str = 'My status'
      } else {
        str = `${getName(hpub)} (My status)`
      }
      if (!numUpdates) {
        drawEllipse(v, v.bgColor,     115, g.y+index*200 + 105, 63, 63)
        drawEllipse(v, colors.accent, 118, g.y+index*200 + 108, 57, 57)
        mat4.identity(m)
        mat4.translate(m, m, [135, g.y+index*200 + 155, 0])
        mat4.scale(m, m, [textScale, textScale, 1])
        defaultFont.draw(0,0, '+', v.bgColor, v.mat, m)
      }
    } else {
      str = getName(hpub)
    }
    const max_len = -32 + v.sw-211-32 + ((rank && !v.keys.includes(hpub))? -2*(20/14) - Math.ceil(rank/3)*26*(20/14) - rank*4: 0)
    while (str.length > 1 && defaultFont.calcWidth(str)*textScale > max_len) {
      str = str.replace(/…$/,'')
      str = str.replace(/.$/,'') + '…'
    }
    mat4.identity(m)
    mat4.translate(m, m, [211, g.y+index*200 + 87, 0])
    mat4.scale(m, m, [textScale, textScale, 1])
    defaultFont.draw(0,0, str, v.titleColor, v.mat, m)

    // subtitle / message / info
    mat4.identity(m)
    mat4.translate(m, m, [211, g.y+index*200 + 152, 0])
    mat4.scale(m, m, [30/14, 30/14, 1])
    const subtitle =
      (g === v.discoverGad)?'Public channel':
      (g === v.channelsGad)?(v.keys.includes(hpub)?`The channel was created`:'Public channel'):
      updatePostedAsOf(newest)
    defaultFont.draw(0,0, subtitle, v.subtitleColor, v.mat, m)

    // the last update time (for followed channels)
    if (g === v.channelsGad) {
      const ts = 25/14
      const str = `12:37 BTC`
      const w = defaultFont.calcWidth(str)*ts
      mat4.identity(m)
      mat4.translate(m, m, [v.sw-45-w, g.y+index*200 + 82, 0])
      mat4.scale(m, m, [ts, ts, 1])
      defaultFont.draw(0,0, str, numNew? colors.accent: v.subtitleColor, v.mat, m)

      // the number of new messages
      if (numNew) {
        console.log('updates:', v.query.results.filter(u => u.hpub == hpub))
        const ts = 21/14
        const str = `${numNew}`
        const tw = defaultFont.calcWidth(str)*ts
        const w = Math.max(55, 19 + tw)
        drawPill(v, colors.accent, v.sw-42-w, g.y+index*200 + 109, w,55)
        mat4.identity(m)
        mat4.translate(m, m, [v.sw-42-(w+tw)/2, g.y+index*200 + 82 + 66, 0])
        mat4.scale(m, m, [ts, ts, 1])
        defaultFont.draw(0,0, str, v.bgColor, v.mat, m)
      }
    }

    // the follow button (for discovery channels)
    if (g === v.discoverGad) {
      if (amFollowingChannel(v.discover[index])) {
        const bw = 263, bh = 83
        drawPill(v, colors.inactive, v.sw-42-bw,g.y+index*200+53, bw,bh)
        drawPill(v, v.bgColor, v.sw-42-bw+3,g.y+index*200+53+3, bw-6,bh-6)
        const label = 'Following'
        const ts = 29/14
        const w = defaultFont.calcWidth(label)*ts
        mat4.identity(m)
        mat4.translate(m, m, [v.sw-42-bw/2-w/2, g.y+index*200+53 + 55, 0])
        mat4.scale(m, m, [ts, ts, 1])
        defaultFont.draw(0,0, label, colors.accent, v.mat, m)
      } else {
        const bw = 208, bh = 83
        drawPill(v, blend(v.bgColor,hue(colors.accent),TINGE.ACTION_BUTTON), v.sw-42-bw,g.y+index*200+53, bw,bh)
        const label = 'Follow'
        const ts = 29/14
        const w = defaultFont.calcWidth(label)*ts
        mat4.identity(m)
        mat4.translate(m, m, [v.sw-42-bw/2-w/2, g.y+index*200+53 + 55, 0])
        mat4.scale(m, m, [ts, ts, 1])
        defaultFont.draw(0,0, label, blend(v.titleColor,hue(colors.accent),TINGE.ACTION_BUTTON), v.mat, m)
      }
    } /* else if (rank && !v.keys.includes(hpub)) {
      mat4.identity(m)
      let iconScale = 20/14
      let d = 4*iconScale
      mat4.translate(m, m, [v.sw - 32+28+4+26/iconScale, g.y+index*200 + 85, 0])
      mat4.scale(m, m, [iconScale, iconScale, 1])
      for (let r = 0; r < rank; r++) {
        defaultFont.draw(-28-d - ((r%3)==0?26:0), 0, '💗', v.bgColor, v.mat, m)
        defaultFont.draw(-28, 0, '❤', v.bgColor, v.mat, m)
        defaultFont.draw(-28, 0, rankIcon, rankColor, v.mat, m)
      }
    } */

    i++
  }

  let g = v.exploreGad
  drawPill(v, colors.inactive, g.x,g.y, g.w,g.h)
  drawPill(v, v.bgColor, g.x+3,g.y+3, g.w-6,g.h-6)
  const label = 'Explore more'
  const ts = 29/14
  const w = defaultFont.calcWidth(label)*ts
  mat4.identity(m)
  mat4.translate(m, m, [g.x+g.w/2-w/2, g.y + 66, 0])
  mat4.scale(m, m, [ts, ts, 1])
  defaultFont.draw(0,0, label, colors.accent, v.mat, m)
  
}
