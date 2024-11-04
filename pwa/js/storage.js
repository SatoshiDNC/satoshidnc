import { Buffer } from 'buffer'
import { Chacha20 } from '../lib/chacha20.js'

export const storageSystems = []

storageSystems.push({
  auth: 'nip-98',
  url: 'https://nostrcheck.me/api/v2/media',
  method: 'POST',
})

export function encrypt(stream) {
  const TAG = 'enc'
  const { readable, writable } = new TransformStream()
  let pos = 0
  var key = new Buffer(32)
  key.fill(0)
  var nonce = new Buffer(12)
  nonce.fill(0)
  return new Promise((resolve, reject) => {
    console.log(`[${TAG}] got stream`)
    const reader = stream.getReader()
    const writer = writable.getWriter()
    const readFunc = () => {
      console.log(`[${TAG}] read`)
      reader.read().then(({ done, value }) => {
        if (value) {
          console.log(`[${TAG}] ${value}`)

          const cipher = new Chacha20(key, nonce, 1)
          var ret = new Buffer(value.length)
          cipher.encrypt(ret, value, value.length)
        
          writer.write(ret).then(() => {
            readFunc()
          })
        } else if (done) {
          console.log(`[${TAG}] done`)
          writer.close()
        } else {
          console.log(`[${TAG}] invalid data`)
        }
      }, reason => {
        console.log(`[${TAG}] read error: ${reason}`)
      })
    }
    readFunc()
    resolve(readable)

    // chacha20.encrypt(key, nonce, new Buffer(plaintext))
  })
}