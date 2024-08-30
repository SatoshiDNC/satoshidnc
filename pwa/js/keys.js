import { getPublicKey } from 'nostr-tools'
import * as nip19 from 'nostr-tools/nip19'
import { Buffer } from 'buffer'

/* secret key should not leave this file */
function hsec() { return window.localStorage.getItem('hsec')||(window.localStorage.setItem('hsec', Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex'))||window.localStorage.getItem('hsec')) }
function bsec() { return Buffer.from(hsec(), 'hex') }
function nsec() { return nip19.nsecEncode(bsec()) }

export function hpub() { return getPublicKey(bsec()) }
export function bpub() { return Buffer.from(hpub(), 'hex') }
export function npub() { return nip19.npubEncode(hpub()) }
