import { chacha20 } from '@noble/ciphers/chacha'
import { randomBytes } from '@noble/hashes/utils'

/* The following constant defines the granularity of random-access decryption
 * at the expense of max safely encrypted file length of CHUNK_SIZE * 2^32.
 * A larger chunk size results in less efficiency when the position within the
 * file does not start on a chunk boundary.
 */
const CHUNK_SIZE = 1024

export function crypt(offset /*number*/, plaintext /*Uint8Array*/, key = randomBytes(44)) /*Uint8Array*/ {
  if (key.length != 44)
    throw new Error(`key must be 44 bytes long (found ${key.length} bytes)`)
  let counter = Math.floor(offset / CHUNK_SIZE)
  const result = new Uint8Array(plaintext.byteLength)
  const padSize = offset - counter * CHUNK_SIZE
  let remaining = padSize + plaintext.byteLength, processed = 0
  const chunk = Math.min(remaining, CHUNK_SIZE)
  const padded = new Uint8Array(chunk)
  padded.set(plaintext.slice(0, Math.min(plaintext.length, padded.length - padSize)), padSize)
  const crypted = cryptContinuous(padded, key, counter)
  result.set(crypted.slice(padSize), 0)
  remaining -= chunk
  processed += chunk - padSize
  while (remaining > 0) {
    counter += 1
    const chunk = Math.min(remaining, CHUNK_SIZE)
    const padded = new Uint8Array(chunk)
    padded.set(plaintext.slice(processed, processed + Math.min(plaintext.length - processed, CHUNK_SIZE)), 0)
    const crypted = cryptContinuous(padded, key, counter)
    result.set(crypted, processed)
    remaining -= chunk
    processed += chunk
  }
  return result
}

function cryptContinuous(plaintext /*Uint8Array*/, key = randomBytes(44), counter /*number*/) /*Uint8Array*/ {
  if (key.length != 44)
    throw new Error(`key must be 44 bytes long (found ${key.length} bytes)`)
  if (counter < 0 || counter > 0xffffffff)
    throw new Error(`counter must be in range [0, 2^32) (found ${counter})`)
  console.log(`plaintext: ${plaintext}, key: ${key}, counter: ${counter}`)
  const key32 = key.slice(0, 32)
  const nonce12 = key.slice(32)
  const ciphertext = chacha20(key32, nonce12, plaintext, undefined, counter)
  return ciphertext
}
