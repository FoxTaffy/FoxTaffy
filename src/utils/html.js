import DOMPurify from 'dompurify'

const ALLOWED_TAGS = ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'a', 'blockquote', 'h3', 'h4']

// Любая ссылка из пользовательского HTML открывается безопасно.
DOMPurify.addHook('afterSanitizeAttributes', node => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer nofollow')
  }
})

/** HTML из БД → безопасный HTML для v-html (белый список, без style/on*-атрибутов). */
export function sanitizeHtml(html) {
  if (!html) return ''
  return DOMPurify.sanitize(String(html), { ALLOWED_TAGS, ALLOWED_ATTR: ['href'] })
}

/** HTML → plain text без исполнения разметки (DOMParser создаёт инертный документ). */
export function stripHtml(html) {
  if (!html) return ''
  return new DOMParser().parseFromString(String(html), 'text/html').body.textContent || ''
}
