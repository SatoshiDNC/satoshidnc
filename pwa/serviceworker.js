import { minutelyTasks } from './js/periodic.js'

const offlineCache = 'oc-2024101401'
const appShellFiles = [
  '/',
  '/index.html',
  '/lib/gl-matrix.js',
  '/lib/fireglass.min.js',
  '/lib/fireglass-for-printer.min.js',
  '/lib/rune.min.js',
  '/lib/rune-for-printer.min.js',
  '/lib/webusb-receipt-printer.umd.js',
  '/lib/thermal-printer-encoder.umd.js',
  '/js/globals.js',
  '/js/font/defaultFont.js',
  '/js/font/receiptFont.js',
  '/js/font/nybbleFont.js',
  '/js/font/iconFont.js',
  '/js/sendBar.js',
  '/js/receipt.js',
  '/js/init.js',
  '/js/view/home-chat/bar-top.js',
  '/js/view/home-chat/new-chat/bar-top.js',
  '/js/view/chat-room/bar-top.js',
  '/js/view/menu.js',
  '/js/view/chat-room/root.js',
  '/js/view/home-chat/root.js',
  '/js/view/home-chat/content.js',
  '/js/view/home-chat/new-chat/root.js',
  '/js/view/home-chat/new-chat/content.js',
  '/js/view/home-chat/new-chat/new-contact/bar-top.js',
  '/js/view/home-chat/new-chat/new-contact/root.js',


  "/pwa-examples/js13kpwa/",
  "/pwa-examples/js13kpwa/index.html",
  "/pwa-examples/js13kpwa/app.js",
  "/pwa-examples/js13kpwa/style.css",
  "/pwa-examples/js13kpwa/fonts/graduate.eot",
  "/pwa-examples/js13kpwa/fonts/graduate.ttf",
  "/pwa-examples/js13kpwa/fonts/graduate.woff",
  "/pwa-examples/js13kpwa/favicon.ico",
  "/pwa-examples/js13kpwa/img/js13kgames.png",
  "/pwa-examples/js13kpwa/img/bg.png",
  "/pwa-examples/js13kpwa/icons/icon-32.png",
  "/pwa-examples/js13kpwa/icons/icon-64.png",
  "/pwa-examples/js13kpwa/icons/icon-96.png",
  "/pwa-examples/js13kpwa/icons/icon-128.png",
  "/pwa-examples/js13kpwa/icons/icon-168.png",
  "/pwa-examples/js13kpwa/icons/icon-192.png",
  "/pwa-examples/js13kpwa/icons/icon-256.png",
  "/pwa-examples/js13kpwa/icons/icon-512.png",
];
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
self.addEventListener('fetch', (event) => {
  console.log('[SW] fetch', event.request.url)
  event.respondWith(async function() {

    const cache = await caches.open(offlineCache)
    const cachedResponse = await cache.match(event.request)

    console.log(cachedResponse.headers)

    const networkResponsePromise = fetch(event.request)

    event.waitUntil(async function() {
      const networkResponse = await networkResponsePromise
      await cache.put(event.request, networkResponse.clone())
      console.log('[SW] cached', event.request.url)
    }())

    // Returned the cached response if we have one, otherwise return the network response.
    return cachedResponse || networkResponsePromise
  }())
})
