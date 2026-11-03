<template>
  <ModalDialog :open="wizard.open.value" :title="wizard.form.id ? 'Редактировать мероприятие' : 'Новое мероприятие'" size="lg" persistent @close="requestClose">
    <nav class="stepper" aria-label="Шаги">
      <button
        v-for="(item, index) in wizard.steps.value"
        :key="item.id"
        type="button"
        class="step"
        :class="{ 'is-active': wizard.step.value === item.id, 'is-done': index < wizard.stepIndex.value }"
        :disabled="item.id !== 'main' && !wizard.basicsValid.value"
        :aria-current="wizard.step.value === item.id ? 'step' : undefined"
        @click="wizard.step.value = item.id"
      >
        <b>{{ index + 1 }}</b>{{ item.title }}
      </button>
    </nav>

    <div v-if="wizard.loading.value" class="state-box"><div class="spinner"></div></div>
    <component :is="STEP_VIEWS[wizard.step.value]" v-else />

    <template #footer>
      <button type="button" class="btn" :disabled="wizard.stepIndex.value === 0 || wizard.saving.value" @click="move(-1)"><i class="fas fa-arrow-left"></i> Назад</button>
      <span class="grow"></span>
      <button type="button" class="btn" :disabled="wizard.saving.value" @click="requestClose">Отмена</button>
      <button v-if="!isLast" type="button" class="btn" :disabled="!wizard.basicsValid.value" @click="move(1)">Далее <i class="fas fa-arrow-right"></i></button>
      <button type="button" class="btn btn-primary" :disabled="!wizard.valid.value || wizard.saving.value || wizard.uploading.value" @click="save">
        <span v-if="wizard.saving.value" class="spinner spinner-sm"></span>
        <span v-else><i class="fas fa-check"></i></span>
        {{ wizard.form.id ? 'Сохранить' : 'Создать' }}
      </button>
    </template>
  </ModalDialog>

  <ConfirmDialog
    :open="confirmClose"
    title="Закрыть без сохранения?"
    message="В форме есть несохранённые изменения. Загруженные, но не сохранённые файлы будут удалены."
    confirm-text="Закрыть"
    cancel-text="Продолжить редактирование"
    danger
    @confirm="discard"
    @cancel="confirmClose = false"
  />
</template>

<script setup>
import { computed, provide, ref } from 'vue'
import { EVENT_FORM_KEY } from '@/composables/useEventForm.js'
import ConfirmDialog from '../ConfirmDialog.vue'
import ModalDialog from '../ModalDialog.vue'
import EventStepMain from './EventStepMain.vue'
import EventStepPhotos from './EventStepPhotos.vue'
import EventStepPlace from './EventStepPlace.vue'
import EventStepPurchases from './EventStepPurchases.vue'
import EventStepReview from './EventStepReview.vue'

const props = defineProps({ wizard: { type: Object, required: true } })
const emit = defineEmits(['saved'])

const STEP_VIEWS = { main: EventStepMain, place: EventStepPlace, review: EventStepReview, purchases: EventStepPurchases, gallery: EventStepPhotos }

provide(EVENT_FORM_KEY, props.wizard)

const confirmClose = ref(false)
const isLast = computed(() => props.wizard.stepIndex.value === props.wizard.steps.value.length - 1)

function move(delta) {
  const next = props.wizard.steps.value[props.wizard.stepIndex.value + delta]
  if (next) props.wizard.step.value = next.id
}

function requestClose() {
  if (props.wizard.dirty.value) confirmClose.value = true
  else props.wizard.close()
}

function discard() {
  confirmClose.value = false
  props.wizard.close()
}

async function save() {
  const saved = await props.wizard.save()
  if (saved) emit('saved', saved)
}
</script>
