/** HMAC-SHA256 signed action tokens for review approve/reject links. */

const enc = new TextEncoder()

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

/** Payload: `${id}:${action}:${exp}` */
export async function signAction(
  secret: string,
  id: string,
  action: 'approve' | 'reject',
  expUnix: number,
): Promise<string> {
  const key = await importKey(secret)
  const data = enc.encode(`${id}:${action}:${expUnix}`)
  const sig = await crypto.subtle.sign('HMAC', key, data)
  return toHex(sig)
}

export async function verifyAction(
  secret: string,
  id: string,
  action: string,
  expUnix: number,
  sigHex: string,
): Promise<boolean> {
  if (action !== 'approve' && action !== 'reject') return false
  if (!id || !sigHex || !Number.isFinite(expUnix)) return false
  if (Math.floor(Date.now() / 1000) > expUnix) return false
  const expected = await signAction(secret, id, action, expUnix)
  if (expected.length !== sigHex.length) return false
  // constant-time-ish compare
  let ok = 0
  for (let i = 0; i < expected.length; i++) {
    ok |= expected.charCodeAt(i) ^ sigHex.charCodeAt(i)
  }
  return ok === 0
}
