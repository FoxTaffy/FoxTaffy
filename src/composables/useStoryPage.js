import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useReveal } from '@/composables/useReveal'
import { useSlideViewer } from '@/composables/useSlideViewer'
import { useCharacterArts } from '@/composables/useCharacterArts'
import { artSlides } from '@/utils/slides'

/**
 * Каркас страницы-истории: вьювер, раскрытие при скролле, галерея персонажа,
 * активная глава и открытие слайда по ссылке (#id).
 * slideLists — функция, возвращающая списки слайдов страницы (кроме галереи).
 */
export function useStoryPage({ character, fallbackArts, slideLists }) {
  const viewer = useSlideViewer()
  const { scan } = useReveal()
  const { arts, loading, isFallback, load } = useCharacterArts(character, fallbackArts)

  const active = ref('')
  const gallerySlides = computed(() => artSlides(arts.value))

  const openIn = (list, id) => viewer.open(list, Math.max(0, list.findIndex((slide) => slide.id === id)))

  const openFromHash = () => viewer.openByHash([...slideLists(), gallerySlides.value])

  onMounted(async () => {
    await load()
    await nextTick()
    scan()
    openFromHash()
    window.addEventListener('hashchange', openFromHash) // ссылка вставлена в уже открытую вкладку
  })

  onBeforeUnmount(() => window.removeEventListener('hashchange', openFromHash))

  return { viewer, arts, loading, isFallback, gallerySlides, active, openIn }
}
