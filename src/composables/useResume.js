import { ref } from 'vue'

/** Запоминает последнюю прочитанную главу в localStorage (недоступен — работаем без него). */
export function useResume(key) {
  const read = () => {
    try { return localStorage.getItem(key) } catch { return null }
  }

  const resumeId = ref(read())

  const remember = (id) => {
    try { localStorage.setItem(key, id) } catch { /* приватный режим */ }
  }

  const forget = () => { resumeId.value = null }

  return { resumeId, remember, forget }
}
