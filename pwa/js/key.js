import { getPublicKey } from 'nostr-tools'
import * as nip19 from 'nostr-tools/nip19'
import { Buffer } from 'buffer'

export function hsec() { return window.localStorage.getItem('hsec')||(window.localStorage.setItem('hsec', Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex'))||window.localStorage.getItem('hsec')) }
export function hpub() { return getPublicKey(Buffer.from(hsec(), 'hex')) }
export function npub() { return nip19.npubEncode(hpub()) }
export function nsec() { return nip19.nsecEncode(Buffer.from(hsec(), 'hex')) }
