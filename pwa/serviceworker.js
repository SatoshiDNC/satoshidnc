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
self.addEventListener('fetch', (event) => {
  // console.log('[SW] fetch', event.request.url)
  event.respondWith(async function() {

    const cache = await caches.open(offlineCache)
    const cachedResponse = undefined // await cache.match(event.request)
    const asOf = cacheDates[event.request.url]

    let networkResponsePromise
    if ((!cachedResponse) || (!asOf) || (Date.now() - asOf > ONE_DAY_IN_MILLISECONDS)) {
      networkResponsePromise = fetch(event.request)

      if (event.request.url.startsWith(`https://`) && !event.request.url.endsWith('.mp3')) {
        event.waitUntil(async function() {
          const networkResponse = await networkResponsePromise
          await cache.put(event.request, networkResponse.clone())
          cacheDates[event.request.url] = Date.now()
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
  }())
})
