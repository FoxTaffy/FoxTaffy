<template>
  <form class="stack" @submit.prevent="submit">
    <section class="card stack">
      <h3><i class="fas fa-info-circle"></i> Основное</h3>
      <ArtFields v-model="form" />
    </section>

    <section class="card stack">
      <h3><i class="fas fa-cloud-upload-alt"></i> Изображение</h3>

      <div class="tab-row" role="tablist">
        <button type="button" class="tab" :class="{ active: method === 'file' }" role="tab" :aria-selected="method === 'file'" @click="setMethod('file')">
          <i class="fas fa-cloud-upload-alt"></i> Загрузить файл
        </button>
        <button type="button" class="tab" :class="{ active: method === 'url' }" role="tab" :aria-selected="method === 'url'" @click="setMethod('url')">
          <i class="fas fa-link"></i> По ссылке
        </button>
      </div>

      <ImageUploader
        v-if="method === 'file'"
        v-model="form.imageUrl"
        folder="arts"
        thumbnail
        hint="Перетащите арт сюда или нажмите. До 10 МБ, миниатюра создаётся автоматически"
        @uploaded="form.thumbnailUrl = $event.thumbnailUrl"
        @removed="form.thumbnailUrl = ''"
        @error="notify($event, 'error')"
      />

      <div v-else class="stack">
        <label class="form-field">
          <span class="form-label is-required">Ссылка на изображение</span>
          <input v-model="form.imageUrl" class="input" type="url" placeholder="https://example.com/image.jpg">
        </label>
        <p v-if="form.imageUrl && !safeUrl" class="hint is-danger">Нужна ссылка вида https://…</p>
        <div v-if="safeUrl" class="media-card-img">
          <img :src="safeUrl" alt="Предпросмотр" @load="urlLoaded = true" @error="urlLoaded = false">
        </div>
        <p v-if="safeUrl && urlLoaded === false" class="hint is-danger">Изображение по ссылке не открывается</p>
      </div>
    </section>

    <div class="btn-actions is-end">
      <button type="button" class="btn" :disabled="!dirty || busy" @click="reset"><i class="fas fa-undo"></i> Сбросить</button>
      <button type="submit" class="btn btn-primary" :disabled="!valid || busy">
        <span v-if="busy" class="spinner spinner-sm"></span>
        <span v-else><i class="fas fa-cloud-upload-alt"></i></span>
        Добавить арт
      </button>
    </div>
  </form>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { emptyArtForm, useCatalog } from '@/composables/useAdminCatalog.js'
import { useAdminNotify } from '@/composables/useAdminNotify.js'
import { safeHttpUrl } from '@/utils/eventUtils.js'
import ArtFields from './ArtFields.vue'
import ImageUploader from './ImageUploader.vue'

const emit = defineEmits(['dirty', 'added'])
const catalog = useCatalog()
const notify = useAdminNotify()

const form = reactive(emptyArtForm())
const method = ref('file')
const busy = ref(false)
const urlLoaded = ref(null)

const safeUrl = computed(() => (method.value === 'url' ? safeHttpUrl(form.imageUrl.trim()) : null))
const valid = computed(() =>
  form.title.trim().length >= 3 && !!form.artist && !!form.imageUrl && (method.value === 'file' || (safeUrl.value && urlLoaded.value !== false)))
const dirty = computed(() => !!(form.title || form.artist || form.imageUrl || form.tags.length || form.characters.length || form.isNsfw))

// Файл и ссылка делят одно поле: при переключении очищаем его, иначе чужое значение считалось бы валидным
function setMethod(value) {
  if (method.value === value) return
  method.value = value
  Object.assign(form, { imageUrl: '', thumbnailUrl: '' })
  urlLoaded.value = null
}

const reset = () => Object.assign(form, emptyArtForm())

async function submit() {
  if (!valid.value || busy.value) return
  busy.value = true
  const { ok } = await catalog.addArt(form)
  busy.value = false
  if (ok) {
    reset()
    emit('added')
  }
}

watch(dirty, value => emit('dirty', value), { immediate: true })
watch(() => form.imageUrl, () => { urlLoaded.value = null })

// Вкладка живёт под <KeepAlive>, поэтому предупреждаем и о закрытии страницы с черновиком
const warnBeforeUnload = (event) => { if (dirty.value) event.preventDefault() }
onMounted(() => window.addEventListener('beforeunload', warnBeforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', warnBeforeUnload))
</script>
