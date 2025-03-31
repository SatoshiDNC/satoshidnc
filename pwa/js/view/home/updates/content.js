import { drawPill, drawAvatar, drawEllipse, drawRect } from '../../../draw.js'
import { contentView as chatRoomView } from '../../chat-room/content.js'
import { getPersonalData as getAttr } from '../../../personal.js'
import { addedOn, updatePostedAsOf } from '../../util.js'
import { aggregateEvent, getUpdates, eventTrigger } from '../../../content.js'
import { rootView as displayView } from './display/root.js'
import { barBot } from '../bar-bot.js'
import { signBatch as sign, defaultKey, keys } from '../../../keys.js'

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.splashMode = 0
v.frameTimes = []
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.textColor = [1,1,1,1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.subtitleColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
v.displayAction = function(updates, hpub, returnView, root, target) {
  const v = this
  //console.log(`DISPLAY ACTION:`, updates, hpub, returnView, root, target)

  // TODO: sign pledge to zap author in exchange for decryption key
  console.log('send')
  let checkmark_events = []
  let new_count = 0
  let to_sign = []
  let keys_owed = []
  let total_cost = 0
  for (const u of updates) if (u.hpub == hpub && u.data.tags.filter(t=>t[0]=='encryption').length>0 && !u.viewed) {
    new_count += 1
    to_sign.push({
      kind: 7,
      content: '✓',
      tags: [['e',`${u.data.id}`], ['p',`${u.hpub}`], ['k',`${u.data.kind}`]],
    })
    keys_owed.push(u.data.id)
    total_cost += Math.max(1 /* enforce non-zero cost (at all costs) */, +(u.data.tags.filter(t => t[0] == 'c')?.[0]?.[1] || '0'))
  }
  if (new_count == 0 && total_cost == 0) {
    displayView.setContext(updates, hpub, returnView)
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
    tags: [['IOU',`${total_cost}`,'sat',`updates`], ...keys_owed.map(id => ['UOI','1','x',`e ${id} key`]), ['IOU',`${new_count}`,'x',`reaction`], ['p',`${hpub}`]],
  })
  to_sign.unshift({
    kind: 555,
    tags: [['IOU','1','sat',`POST /unlock?id=${keys_owed.join(',')}`], ['p',`${satoshi_hpub}`]],
  })
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
  }).then(([auth, deal, ...checkmarks]) => {
    checkmark_events = checkmarks
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
      console.log(json)
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
    console.log('Result:', json)
    json.map(r => {
      if (r[1] == 'ok') {
        r[2].tags.filter(t => t[0] == 'e').map(t => t[1]).map(id => {
          console.log('map1')
          updates.filter(u => u.data.id == id).map(u => {
            console.log('map2', r[2].content)
            u.data._key = r[2].content
            console.log(u)
          })
        })
        aggregateEvent(r[2])
      }
    })
    displayView.setContext(updates, hpub, returnView)
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
    if (updates.length == 0) return
    v.displayAction(updates, v.selfs[index], v.parent.parent, g.root, g.target)
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
    v.displayAction(updates, updates[0].hpub, v.parent.parent, g.root, g.target)
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
  for (const update of v.query.results) {
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
  v.selfs = keys.map(k => k.hpub)
  v.recents = recents
  v.viewed = viewed

  let x = 42
  let g
  g = v.selfsGad
  g.x = 0, g.y = 170
  g.w = v.sw, g.h = keys.length * 200
  g.autoHull()
  g = v.recentsGad
  g.x = 0, g.y = v.selfsGad.y + ((v.selfs.length > 0) ? v.selfsGad.h + 66 : 0) // 466
  g.w = v.sw, g.h = recents.length * 200
  g.autoHull()
  g = v.viewedGad
  g.x = 0, g.y = v.recentsGad.y + ((recents.length > 0) ? v.recentsGad.h + 96 : 0)
  g.w = v.sw, g.h = viewed.length * 200
  g.autoHull()

  v.minX = 0, v.maxX = v.sw
  v.minY = 0, v.maxY = v.viewedGad.y + v.viewedGad.h

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

  barBot.paneGads.filter(g => g.label == 'Updates')[0].new = false

  mat4.identity(m)
  mat4.translate(m, m, [45, 125, 0])
  mat4.scale(m, m, [41/14, 41/14, 1])
  let x = 0, y = 0
  defaultFont.draw(x,y, 'Status', v.textColor, v.mat, m)

  if (v.recents.length > 0) {
    mat4.identity(m)
    mat4.translate(m, m, [45, v.recentsGad.y-32 /*434*/, 0])
    mat4.scale(m, m, [28/14, 28/14, 1])
    defaultFont.draw(x,y, 'Recent updates', v.subtitleColor, v.mat, m)
  }

  if (v.viewed.length > 0) {
    mat4.identity(m)
    mat4.translate(m, m, [45, v.viewedGad.y-32 /*434 + (v.recents.length>0 ? v.recents.length * 200 + 98 : 0)*/, 0])
    mat4.scale(m, m, [28/14, 28/14, 1])
    defaultFont.draw(x,y, 'Viewed updates', v.subtitleColor, v.mat, m)
  }

  let i = 0
  for (let hpub of [...v.selfs, ...v.recents, ...v.viewed]) {
    const numUpdates = v.query.results.filter(u => u.hpub == hpub).length
    const newest = v.query.results.filter(u => u.hpub == hpub).reduce((a,c) => Math.max(a,c.data.created_at * 1000), 0)
    const numViewed = v.query.results.filter(u => u.hpub == hpub).reduce((a,c) => a+(c.viewed?1:0), 0)
    const y = i * 200 + (i >= v.selfs.length? 96:0) + ((v.viewed.includes(hpub) && v.recents.length > 0)? 96:0)
    const g = i < v.selfs.length? v.selfsGad: i < v.selfs.length + v.recents.length? v.recentsGad: v.viewedGad
    const index = i < v.selfs.length? i: i < v.selfs.length + v.recents.length? i - v.selfs.length: i - v.selfs.length - v.recents.length
    if (numUpdates) {
      drawEllipse(v, colors.accent, 32, g.y + 6 + index * 200, 147, 147)
      if (numViewed) {
        drawEllipse(v, colors.inactive, 32, g.y + 6 + index * 200 + 147, 147, -147, numViewed/numUpdates, -numViewed/numUpdates)
      }
      drawEllipse(v, v.bgColor, 38, g.y + 12 + index * 200, 135, 135)
      if (numUpdates > 1) for (let i = 0; i < numUpdates; i++) {
        // drawRect(v, v.bgColor, 105 - 3, 491, 6, 8)
        mainShapes.useProg2()
        gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(v.bgColor))
        gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
        mat4.identity(m)
        // mat4.translate(m,m, [105, 565.5 + y, 0])
        mat4.translate(m,m, [105, g.y + 79.5 + index * 200, 0])
        mat4.rotate(m,m, 2*Math.PI*i/numUpdates, [0, 0, 1])
        mat4.translate(m,m, [-3, -74.5, 0])
        mat4.scale(m,m, [6, 8, 1])
        gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
        mainShapes.drawArrays2('rect')
      }
    }

    // drawAvatar(v, hpub, 43,503 + y, 125,125)
    // drawEllipse(v, colors.inactiveDark, 43, 503 + y, 125, 125)
    drawEllipse(v, colors.inactiveDark, 43, g.y + 17 + index * 200, 125, 125)

    let str
    if (v.selfs.includes(hpub)) {
      if (v.selfs.length == 1) {
        str = 'My status'
      } else {
        str = `${getAttr(hpub, 'name') || 'Unnamed'} (My status)`
      }
      if (!numUpdates) {
        drawEllipse(v, v.bgColor,     115, g.y + 85 + index * 200, 63, 63)
        drawEllipse(v, colors.accent, 118, g.y + 88 + index * 200, 57, 57)
        mat4.identity(m)
        mat4.translate(m, m, [135, g.y + 135 + index * 200, 0])
        mat4.scale(m, m, [35/14, 35/14, 1])
        defaultFont.draw(0,0, '+', v.bgColor, v.mat, m)
      }
    } else {
      str = getAttr(hpub, 'name') || 'Unnamed'
    }
    mat4.identity(m)
    // mat4.translate(m, m, [211, 553 + y, 0])
    mat4.translate(m, m, [211, g.y + 67 + index * 200, 0])
    mat4.scale(m, m, [35/14, 35/14, 1])
    defaultFont.draw(0,0, str, v.titleColor, v.mat, m)
  
    mat4.identity(m)
    // mat4.translate(m, m, [211, 618 + y, 0])
    mat4.translate(m, m, [211, g.y + 132 + index * 200, 0])
    mat4.scale(m, m, [30/14, 30/14, 1])
    defaultFont.draw(0,0, updatePostedAsOf(newest), v.subtitleColor, v.mat, m)

    i++
  }
  
}
