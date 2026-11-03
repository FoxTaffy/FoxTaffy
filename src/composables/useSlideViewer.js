import { ref, shallowRef, computed, onMounted, onBeforeUnmount } from 'vue'

const AUTOPLAY_MS = 4500
const SWIPE_PX = 60

/**
 * Состояние слайд-вьювера: навигация, свайп, слайд-шоу и глубокие ссылки (#id слайда).
 * Слайд: { id, src, title, sub }.
 */
export function useSlideViewer() {
  const slides = shallowRef([])
  const index = ref(-1)
  const playing = ref(false)
  const current = computed(() => slides.value[index.value] ?? null)

  let timer = null
  let swipeFrom = null

  const setHash = (hash) => {
    const url = `${location.pathname}${location.search}${hash}`
    history.replaceState(history.state, '', url) // state роутера сохраняем
  }

  const stopPlay = () => {
    clearInterval(timer)
    timer = null
    playing.value = false
  }

  const go = (i) => {
    index.value = i
    setHash(`#${current.value.id}`)
  }

  const open = (list, i = 0) => {
    slides.value = list
    document.body.classList.add('scroll-lock')
    go(i)
  }

  const close = () => {
    stopPlay()
    index.value = -1
    document.body.classList.remove('scroll-lock')
    setHash('')
  }

  const step = (delta) => {
    const next = index.value + delta
    if (next >= 0 && next < slides.value.length) go(next)
    else stopPlay()
  }

  const togglePlay = () => {
    if (playing.value) return stopPlay()
    playing.value = true
    timer = setInterval(() => {
      go((index.value + 1) % slides.value.length)
    }, AUTOPLAY_MS)
  }

  /** Открывает слайд по id из hash, если он есть в одном из списков. */
  const openByHash = (lists) => {
    const id = decodeURIComponent(location.hash.slice(1))
    if (!id) return false
    for (const list of lists) {
      const i = list.findIndex((s) => s.id === id)
      if (i !== -1) {
        open(list, i)
        return true
      }
    }
    return false
  }

  /** 'shared' | 'copied' | 'failed' */
  const share = async () => {
    const url = `${location.origin}${location.pathname}#${current.value.id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: current.value.title, url })
        return 'shared'
      }
      await navigator.clipboard.writeText(url)
      return 'copied'
    } catch (e) {
      return e.name === 'AbortError' ? 'shared' : 'failed'
    }
  }

  const swipeStart = (e) => { swipeFrom = e.clientX }
  const swipeEnd = (e) => {
    if (swipeFrom === null) return
    const dx = e.clientX - swipeFrom
    swipeFrom = null
    if (Math.abs(dx) > SWIPE_PX) step(dx < 0 ? 1 : -1)
  }

  const onKey = (e) => {
    if (!current.value) return
    if (e.key === 'Escape') close()
    else if (e.key === 'ArrowLeft') step(-1)
    else if (e.key === 'ArrowRight') step(1)
    else if (e.key === ' ') { e.preventDefault(); togglePlay() }
  }

  const onVisibility = () => { if (document.hidden) stopPlay() }

  onMounted(() => {
    window.addEventListener('keydown', onKey)
    document.addEventListener('visibilitychange', onVisibility)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKey)
    document.removeEventListener('visibilitychange', onVisibility)
    stopPlay()
    document.body.classList.remove('scroll-lock')
  })

  return { slides, index, current, playing, open, close, step, togglePlay, openByHash, share, swipeStart, swipeEnd }
}
