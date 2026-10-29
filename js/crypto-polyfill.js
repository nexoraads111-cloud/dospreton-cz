/**
 * Ensure crypto.randomUUID exists on HTTP (non-secure contexts).
 * Must load BEFORE @supabase/supabase-js CDN.
 */
;(function (g) {
  var c = g.crypto
  if (!c) {
    try {
      c = {}
      Object.defineProperty(g, 'crypto', { value: c, configurable: true })
    } catch (_) {
      g.crypto = c = {}
    }
  }

  if (typeof c.randomUUID === 'function') return

  function bytesToUuid(bytes) {
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    var hex = []
    for (var i = 0; i < 16; i++) {
      var h = bytes[i].toString(16)
      hex.push(h.length === 1 ? '0' + h : h)
    }
    return (
      hex.slice(0, 4).join('') +
      '-' +
      hex.slice(4, 6).join('') +
      '-' +
      hex.slice(6, 8).join('') +
      '-' +
      hex.slice(8, 10).join('') +
      '-' +
      hex.slice(10, 16).join('')
    )
  }

  function randomUUID() {
    var bytes = new Uint8Array(16)
    if (typeof c.getRandomValues === 'function') {
      c.getRandomValues(bytes)
    } else {
      for (var i = 0; i < 16; i++) bytes[i] = (Math.random() * 256) | 0
    }
    return bytesToUuid(bytes)
  }

  try {
    Object.defineProperty(c, 'randomUUID', {
      value: randomUUID,
      configurable: true,
      writable: true,
    })
  } catch (_) {
    c.randomUUID = randomUUID
  }
})(typeof globalThis !== 'undefined' ? globalThis : window)
