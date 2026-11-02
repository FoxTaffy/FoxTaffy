const SITE_ORIGIN = 'https://foxtaffy.gay'

function setMeta(key, content) {
  const attr = key.includes(':') && !key.startsWith('twitter:') ? 'property' : 'name'
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(url) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', url)
}

const FIELD_KEYS = {
  title: ['og:title', 'twitter:title'],
  description: ['description', 'og:description', 'twitter:description'],
  image: ['og:image', 'twitter:image', 'vk:image']
}

/** Единая точка обновления title / OG / Twitter / canonical. */
export function updateMetaTags({ title, description, image, url, noindex = false } = {}) {
  setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow')
  if (title) document.title = title
  for (const [field, keys] of Object.entries(FIELD_KEYS)) {
    const value = { title, description, image }[field]
    if (value) keys.forEach(key => setMeta(key, value))
  }
  if (url) {
    setMeta('og:url', url)
    setCanonical(url)
  }
}

export { SITE_ORIGIN }
