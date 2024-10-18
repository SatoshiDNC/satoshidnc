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
  const headers = new Headers(request.headers)
  const range = headers.get('range')
  console.log(`range:`, range)
  // headers.delete('range')
  // headers.set('range', 'bytes=0-1023')
  for (const pair of event.request.headers.entries()) {
    console.log(pair[0]+ ': '+ pair[1]);
  }

  const newRequest = new Request(request, {
    mode: 'cors',
    credentials: 'omit',
    headers: headers
  })
  return cachedOrLive(event, newRequest)
}
self.addEventListener('fetch', (event) => {
  // console.log('[SW] fetch', event.request.url)
  if (event.request.headers.has('range')) {
    if (event.request.url.startsWith(`https://`) && !event.request.url.endsWith('.enc.mp3')) {
      console.log('[SW] fetch encrypted range', event.request.url)
      event.respondWith(decryptRange(event))
      return
    } else {
      console.log('[SW] fetch range', event.request.url)
    }
  }
  event.respondWith(cachedOrLive(event))
})
