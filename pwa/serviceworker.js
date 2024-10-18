import { startupTasks } from './js/sw/startup.js'
import { minutelyTasks } from './js/sw/periodic.js'

const DOMAIN = `dev.satoshidnc.com`
const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000
const cacheDates = {}
const offlineCache = 'oc-2024101401'

self.addEventListener('install', event => {
  console.log('[SW] installed')
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  console.log('[SW] activated')
  return self.clients.claim()
})

const MINUTE = 60 * 1000
let minutely
self.addEventListener('sync', event => {
  let now = Date.now()
  switch (event.tag) {
    case 'startup-trigger':
      startupTasks()
      break
    case 'minutely':
      if (minutely && now - minutely < MINUTE) break
      minutely = now
      minutelyTasks()
      break
    default:
      console.log('[SW] sync', event.tag)
  }
})

self.addEventListener('periodicsync', event => {
  console.log('[SW] periodicsync', event.tag)
  // if (event.tag === 'sync-messages') {
  //   event.waitUntil(sendMessages())
  // }
})

let numCached = 0
let logTimer
async function cachedOrLive(event, request = event.request) {
  const cache = await caches.open(offlineCache)
  const cachedResponse = undefined // await cache.match(request)
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
          console.log(`[SW] cached ${numCached} files`)
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
  // const BUFFER_SIZE = 1024 * 1024
  const hash = request.url.split('/').pop().split('.')[0]
  // const headers = new Headers(request.headers)
  // const unit = headers.get('range').split('=')
  // if (unit[0] == 'bytes') {
  //   const byteRange = unit[1].split('-')
  //   console.log('[SW] fetch encrypted range', request.url, byteRange[0])
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
  return fetch(newRequest)
}
self.addEventListener('fetch', (event) => {
  // console.log('[SW] fetch', event.request.url)
  if (event.request.headers.has('range')) {
    const url = event.request.url
    const parts = url.split('/')
    if (parts.length = 5 && parts[0] == 'https:' && parts[1] == '' && parts[3] == 'dec' && url.endsWith('.mp3')) {
      event.respondWith(decryptRange(event))
      return
    } else {
      console.log('[SW] fetch range', event.request.url)
    }
  }
  event.respondWith(cachedOrLive(event))
})
