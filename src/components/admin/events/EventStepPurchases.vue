<template>
  <div class="stack">
    <div v-for="(item, index) in form.purchase_items" :key="index" class="entity">
      <ImageUploader v-model="item.image" :folder="`events/${folder}/purchases`" variant="thumb" hint="" @uploaded="lockFolder" @error="notify($event, 'error')" />
      <div class="entity-body form-grid">
        <input v-model="item.name" class="input" type="text" placeholder="Название покупки" :aria-label="`Покупка ${index + 1}: название`" maxlength="120">
        <input v-model.number="item.price" class="input" type="number" min="0" placeholder="Цена, ₽" :aria-label="`Покупка ${index + 1}: цена`">
      </div>
      <button type="button" class="icon-btn icon-btn-sm is-danger" :aria-label="`Удалить покупку ${index + 1}`" @click="form.purchase_items.splice(index, 1)"><i class="fas fa-times"></i></button>
    </div>

    <p v-if="!form.purchase_items.length" class="hint">Покупок пока нет. Если на мероприятии ничего не покупали, шаг можно пропустить.</p>

    <div class="row is-between is-wrap">
      <button type="button" class="btn btn-sm" @click="form.purchase_items.push({ name: '', price: null, image: '' })"><i class="fas fa-plus"></i> Добавить покупку</button>
      <span v-if="total" class="status-pill is-accent">Итого: {{ total.toLocaleString('ru-RU') }} ₽</span>
    </div>

    <label class="form-field">
      <span class="form-label">Коротко о покупках</span>
      <input v-model="form.purchases_summary" class="input" type="text" maxlength="300" placeholder="Например: два значка и постер">
    </label>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { EVENT_FORM_KEY } from '@/composables/useEventForm.js'
import { notify } from '@/composables/useAdminNotify.js'
import ImageUploader from '../ImageUploader.vue'

const { form, folder, lockFolder } = inject(EVENT_FORM_KEY)
const total = computed(() => form.purchase_items.reduce((sum, item) => sum + (Number(item.price) || 0), 0))
</script>
