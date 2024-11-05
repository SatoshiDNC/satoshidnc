import { Buffer } from 'buffer'
import * as chacha20 from '../lib/chacha20.js'

export const storageSystems = []

storageSystems.push({
  auth: 'nip-98',
  url: 'https://nostrcheck.me/api/v2/media',
  method: 'POST',
})

export function encrypt(key44, stream) {
  const TAG = 'enc'
  const { readable, writable } = new TransformStream()
  const inBuf = [], outBuf = []
  let bufSize = 0, bufPos = 0, streamPos = 0
  const BLOCKSIZE = 1024
  const key = Buffer.from(key44.substring(0, 32*2), 'hex')
  const nonce = Buffer.from(key44.substring(32*2), 'hex')
  return new Promise((resolve, reject) => {
    console.log(`[${TAG}] got stream`)
    const reader = stream.getReader()
    const writer = writable.getWriter()
    const readFunc = () => {
      console.log(`[${TAG}] read`)
      reader.read().then(({ done, value }) => {
        if (value) {
          console.log(`[${TAG}] read ${value.length} bytes to append to buffer`)
          inBuf.push(value)
          bufSize += value.length

          console.log(`[${TAG}] while bufSize ${bufSize} - bufPos ${bufPos} >= BLOCKSIZE ${BLOCKSIZE}`)
          while (bufSize - bufPos >= BLOCKSIZE) {

            let head = inBuf[0].toString('hex').substring(bufPos * 2)
            console.log(`[${TAG}] head ${head}`)
            bufPos += Math.min(BLOCKSIZE, inBuf[0].length)
            console.log(`[${TAG}] bufPos ${bufPos}`)
            while (head.length < BLOCKSIZE * 2) {
              const len = inBuf.pop().length
              bufSize -= len
              bufPos -= len
              console.log(`[${TAG}] while < BLOCKSIZE, bufSize ${bufSize} bufPos ${bufPos}`)
              head = head + inBuf[0].toString('hex').substring(bufPos * 2)
              console.log(`[${TAG}] head ${head}`)
            }
            var block = Buffer.from(head.substring(0, BLOCKSIZE * 2), 'hex')
            console.log(`[${TAG}] block ${block.length}, counter ${Math.floor(streamPos / BLOCKSIZE)}`)

            const cipher = new chacha20.Chacha20(key, nonce, Math.floor(streamPos / BLOCKSIZE))
            const ret = Buffer.alloc(BLOCKSIZE)
            ret.fill(0)
            cipher.encrypt(ret, block, BLOCKSIZE)
            outBuf.push(ret)
            console.log(ret.toString('hex'))

            streamPos += BLOCKSIZE
            console.log(`[${TAG}] streamPos ${streamPos}`)
            console.log(`[${TAG}] while bufSize ${bufSize} - bufPos ${bufPos} >= BLOCKSIZE ${BLOCKSIZE}`)
          }

          const data = new Uint8Array(outBuf.join())
          console.log(`writing`, data)
          if (data.length > 0) {
            writer.write(data).then(() => {
              while (outBuf.length > 0) {
                outBuf.pop()
              }
              readFunc()
            })
          } else {
            readFunc()
          }

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