/**
 * Legacy separate «Nahrané realizace» block — disabled.
 * Supabase uploads now merge into React Realizace (#realizace) with filters.
 * Kept as a no-op so old Pages caches that still load this file do nothing harmful.
 */
;(function () {
  function removeLegacyMount() {
    const mount = document.getElementById('dospreton-supabase-gallery')
    if (mount) mount.remove()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeLegacyMount)
  } else {
    removeLegacyMount()
  }
})()
