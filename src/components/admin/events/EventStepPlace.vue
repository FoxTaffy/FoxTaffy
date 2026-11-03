<template>
  <div class="stack">
    <div class="form-grid">
      <label class="form-field">
        <span class="form-label">Город</span>
        <input v-model="form.city" class="input" type="text" placeholder="Москва" maxlength="80">
      </label>
      <label class="form-field">
        <span class="form-label">Страна</span>
        <input v-model="form.country" class="input" type="text" placeholder="Россия" maxlength="80">
      </label>
    </div>

    <label class="form-field">
      <span class="form-label">Площадка</span>
      <input v-model="form.location" class="input" type="text" placeholder="Название площадки, адрес" maxlength="200">
    </label>

    <label class="form-field">
      <span class="form-label">Официальный сайт</span>
      <input v-model="form.official_website" class="input" type="url" placeholder="https://example.com">
      <span v-if="form.official_website && !safeHttpUrl(form.official_website)" class="hint is-danger">Нужна ссылка вида https://…</span>
    </label>

    <div class="form-grid">
      <label class="form-field">
        <span class="form-label">Ожидаемо гостей</span>
        <input v-model.number="form.expected_visitors" class="input" type="number" min="0" placeholder="500">
      </label>
      <label class="form-field">
        <span class="form-label">Пришло по факту</span>
        <input v-model.number="form.attendees_count" class="input" type="number" min="0" placeholder="После мероприятия">
      </label>
    </div>

    <div class="form-field">
      <span class="form-label">Особенности</span>
      <div class="choice-row">
        <label v-for="item in FEATURES" :key="item.key" class="choice">
          <input v-model="form[item.key]" type="checkbox">
          <i :class="item.icon"></i>{{ item.label }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { EVENT_FORM_KEY } from '@/composables/useEventForm.js'
import { safeHttpUrl } from '@/utils/eventUtils.js'

const FEATURES = [
  { key: 'has_dealers_den', icon: 'fas fa-store', label: 'Торговая зона' },
  { key: 'has_art_show', icon: 'fas fa-palette', label: 'Арт-выставка' },
  { key: 'has_fursuit_parade', icon: 'fas fa-paw', label: 'Фурсьют-парад' }
]

const { form } = inject(EVENT_FORM_KEY)
</script>
