<template>
  <ModalDialog :open="open" :title="`${item ? 'Изменить' : 'Добавить'}: ${KINDS[kind].label.toLowerCase()}`" persistent @close="$emit('close')">
    <form id="entity-form" class="stack" @submit.prevent="save">
      <label class="form-field">
        <span class="form-label is-required">{{ kind === 'artist' ? 'Никнейм' : 'Название' }}</span>
        <input v-model="form.name" class="input" type="text" required maxlength="100" autofocus>
      </label>

      <ImageUploader
        v-if="kind !== 'tag'"
        v-model="form.avatar_url"
        folder="avatars"
        variant="avatar"
        label="Аватар"
        hint="Загрузить"
        @error="notify($event, 'error')"
      />

      <label v-if="kind === 'artist'" class="switch">
        <input v-model="form.is_friend" type="checkbox" role="switch">
        <span><i class="fas fa-star"></i> Друг</span>
      </label>
    </form>

    <template #footer>
      <button type="button" class="btn" :disabled="busy" @click="$emit('close')">Отмена</button>
      <button type="submit" form="entity-form" class="btn btn-primary" :disabled="!form.name.trim() || busy">
        <span v-if="busy" class="spinner spinner-sm"></span>
        <span v-else><i class="fas fa-save"></i></span>
        Сохранить
      </button>
    </template>
  </ModalDialog>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { KINDS, useCatalog } from '@/composables/useAdminCatalog.js'
import { useAdminNotify } from '@/composables/useAdminNotify.js'
import ImageUploader from './ImageUploader.vue'
import ModalDialog from './ModalDialog.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  kind: { type: String, required: true },
  item: { type: Object, default: null }
})
const emit = defineEmits(['close'])

const catalog = useCatalog()
const notify = useAdminNotify()
const form = reactive({ name: '', avatar_url: '', is_friend: false })
const busy = ref(false)

watch(() => props.open, (open) => {
  if (open) Object.assign(form, { name: props.item?.name ?? '', avatar_url: props.item?.avatar_url ?? '', is_friend: !!props.item?.is_friend })
})

async function save() {
  if (busy.value) return
  busy.value = true
  const { ok } = await catalog.saveEntity(props.kind, props.item, form)
  busy.value = false
  if (ok) emit('close')
}
</script>
