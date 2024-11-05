import { Buffer } from 'buffer'
import * as chacha20 from '../lib/chacha20.js'

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
  const key44 = Buffer.from('0001020304050607080910111213141516171819202122232425262728293031323334353637383940414243', 'hex')
  const key = Buffer.from(key44.toString('hex').substring(0, 32*2), 'hex')
  const nonce = Buffer.from(key44.toString('hex').substring(32*2), 'hex')
  return new Promise((resolve, reject) => {
    console.log(`[${TAG}] got stream`)
    const reader = stream.getReader()
    const writer = writable.getWriter()
    const readFunc = () => {
      console.log(`[${TAG}] read`)
      reader.read().then(({ done, value }) => {
        if (value) {
          console.log(`[${TAG}] ${value}`)

          console.log(key.toString('hex'))
          console.log(nonce.toString('hex'))

          const cipher = new chacha20.Chacha20(key, nonce, 0)
          var ret = Buffer.alloc(value.length)
          cipher.encrypt(ret, value, value.length)
          console.log(ret.toString('hex'))
        
          writer.write(new Uint8Array(ret)).then(() => {
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