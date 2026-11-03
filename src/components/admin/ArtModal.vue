<template>
  <ModalDialog :open="!!art" title="Редактировать арт" size="lg" persistent @close="$emit('close')">
    <form v-if="art" id="art-form" class="stack" @submit.prevent="save">
      <div class="split">
        <ArtFields v-model="form" show-date />
        <div class="media-card-img">
          <img :src="art.thumbnail_url || art.image_url" :alt="art.title">
        </div>
      </div>
    </form>

    <template #footer>
      <button type="button" class="btn" :disabled="busy" @click="$emit('close')">Отмена</button>
      <button type="submit" form="art-form" class="btn btn-primary" :disabled="!valid || busy">
        <span v-if="busy" class="spinner spinner-sm"></span>
        <span v-else><i class="fas fa-save"></i></span>
        Сохранить
      </button>
    </template>
  </ModalDialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { artToForm, emptyArtForm, useCatalog } from '@/composables/useAdminCatalog.js'
import ArtFields from './ArtFields.vue'
import ModalDialog from './ModalDialog.vue'

const props = defineProps({ art: { type: Object, default: null } })
const emit = defineEmits(['close'])

const catalog = useCatalog()
const form = reactive(emptyArtForm())
const busy = ref(false)
const valid = computed(() => form.title.trim().length >= 1 && !!form.artist)

watch(() => props.art, (art) => { if (art) Object.assign(form, emptyArtForm(), artToForm(art)) }, { immediate: true })

async function save() {
  if (!valid.value || busy.value) return
  busy.value = true
  const { ok } = await catalog.updateArt(props.art, form)
  busy.value = false
  if (ok) emit('close')
}
</script>
