import { startupTasks } from './js/sw/startup.js'
import { minutelyTasks } from './js/sw/periodic.js'

const TAG = 'sw'
const DOMAIN = `dev.satoshidnc.com`
const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000
const cacheDates = {}
const offlineCache = 'oc-2024101401'

self.addEventListener('install', event => {
  console.log(`[${TAG}] installed`)
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  console.log(`[${TAG}] activated`)
  return self.clients.claim()
})

function startup(sw) {
  startupTasks()
  sw.registration.sync.register('minutely').then(() => {
    console.log(`[${TAG}] registered minutely`)
  }, error => {
    console.error(`[${TAG}] sync registration failed: ${error}`)
  })
}

const MINUTE = 60 * 1000
let minutely
let startup_trigger = false
let waiting_for_database = true
self.addEventListener('sync', event => {
  let now = Date.now()
  switch (event.tag) {
    case 'startup-trigger':
      startup_trigger = true
      if (waiting_for_database) break
      if (!startup_trigger) break
      startup(event.target)
      break
    case 'minutely':
      if (waiting_for_database) break 
      if (minutely && now - minutely < MINUTE) break
      minutely = now
      setTimeout(() => {
        event.target.registration.sync.register('minutely').then(() => {
          // console.log(`[${TAG}] re-registered minutely`)
        }, error => {
          console.error(`[${TAG}] sync registration failed: ${error}`)
        })
      }, 60 * 1000)
      minutelyTasks()
      break
    default:
      console.log(`[${TAG}] sync`, event.tag, event)
    }
})

self.addEventListener('periodicsync', event => {
  console.log(`[${TAG}] periodicsync`, event.tag)
  // if (event.tag === 'sync-messages') {
  //   event.waitUntil(sendMessages())
  // }
})

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'DB_READY') {
    if (!waiting_for_database) return 
    waiting_for_database = false
    console.log(`[${TAG}] received DB-ready all-clear signal`)
    if (!startup_trigger) return
    startup(event.target)
  }
})

let numCached = 0
let logTimer
async function cachedOrLive(event, request = event.request) {
  const cache = await caches.open(offlineCache)
  const cachedResponse = request.url.includes(`dev.satoshidnc.com`)? undefined: await cache.match(request)
  const asOf = cacheDates[request.url]

  let networkResponsePromise
  if ((!cachedResponse) || (!asOf) || (Date.now() - asOf > ONE_DAY_IN_MILLISECONDS)) {
    networkResponsePromise = fetch(request)

    if (request.url.startsWith(`https://`) && !request.url.endsWith('.mp3')) {
      event.waitUntil(async function() {
        const networkResponse = await networkResponsePromise
        await cache.put(request, networkResponse.clone())
        cacheDates[request.url] = Date.now()
        numCached++
        if (logTimer) {
          clearTimeout(logTimer)
        }
        logTimer = setTimeout(() => {
          console.log(`[${TAG}] cached ${numCached} files`)
          numCached = 0
          logTimer = undefined
        }, 1000)
      }())  
    }
  }

  // Returned the cached response if we have one, otherwise return the network response.
  return cachedResponse || networkResponsePromise
}
async function decryptRange(event, request = event.request) {
  const BUFFER_SIZE = 1024 * 1024
  const hash = request.url.split('/').pop().split('.')[0]
  const headers = new Headers(request.headers)
  // const unit = headers.get('range').split('=')
  // if (unit[0] == 'bytes') {
  //   const byteRange = unit[1].split('-')
  //   console.log(`[${TAG}] fetch encrypted range`, request.url, byteRange[0])
  //   headers.set('range', `bytes=${byteRange[0]}-${+byteRange[0]+BUFFER_SIZE-1}`)
  // }
  const { url, req } = request
  //const newRequest = new Request({ url: `https://cdn.satellite.earth/${hash}.enc`, ...req }, {
  const newRequest = new Request({ url: `https://dev.satoshidnc.com/E19.mp3`, ...req }, {
  //const newRequest = new Request(request, {
    mode: 'cors',
    credentials: 'omit',
    headers: headers
  })
  console.log('fetching')
  return fetch(`https://dev.satoshidnc.com/E19.mp3`, {
    headers: {
      "Content-Type": `audio/mpeg`,
      "Range": `bytes=0-${BUFFER_SIZE}`,
    }
  })
}
self.addEventListener('fetch', (event) => {
  // console.log(`[${TAG}] fetch`, event.request.url)
  if (event.request.method != 'GET') return
  if (event.request.headers.has('range')) {
    const url = event.request.url
    const parts = url.split('/')
    if (parts.length = 5 && parts[0] == 'https:' && parts[1] == '' && parts[3] == 'dec' && url.endsWith('.mp3')) {
      console.log(`[${TAG}] detected fetch of audio from encrypted source`, event.request.url)
      event.respondWith(decryptRange(event))
      return
    } else {
      console.log(`[${TAG}] fetch range`, event.request.url)
    }
  }
  event.respondWith(cachedOrLive(event))
})
