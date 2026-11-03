<template>
  <div class="stack">
    <div class="form-grid">
      <label class="form-field">
        <span class="form-label is-required">Название</span>
        <input v-model="form.name" class="input" type="text" placeholder="Any Furry Fest VII" maxlength="120" required>
      </label>
      <label class="form-field">
        <span class="form-label">Подзаголовок</span>
        <input v-model="form.subtitle" class="input" type="text" maxlength="160">
      </label>
    </div>

    <div class="form-field">
      <span class="form-label is-required">Тип</span>
      <div class="choice-row" role="radiogroup" aria-label="Тип мероприятия">
        <label v-for="(type, key) in EVENT_TYPES" :key="key" class="choice">
          <input v-model="form.event_type" type="radio" :value="key">
          <i :class="type.icon"></i>{{ type.single }}
        </label>
      </div>
    </div>

    <div class="form-grid">
      <label class="form-field">
        <span class="form-label is-required">Дата начала</span>
        <input v-model="form.event_date" class="input" type="date" required>
      </label>
      <label class="form-field">
        <span class="form-label">Дата окончания</span>
        <input v-model="form.event_end_date" class="input" type="date" :min="form.event_date">
        <span v-if="!rangeValid" class="hint is-danger">Окончание раньше начала</span>
      </label>
      <label class="form-field">
        <span class="form-label">Дата анонса</span>
        <input v-model="form.announced_date" class="input" type="date">
      </label>
    </div>

    <div class="form-grid">
      <ImageUploader v-model="form.avatar_url" folder="events/avatars" variant="avatar" label="Логотип" hint="Загрузить" @error="notify($event, 'error')" />
      <ImageUploader v-model="form.meta_image" folder="events/banners" variant="banner" label="Баннер" hint="Перетащите баннер или нажмите" @error="notify($event, 'error')" />
    </div>

    <label class="form-field">
      <span class="form-label">Описание</span>
      <textarea v-model="form.description" class="input" rows="3" placeholder="Коротко о мероприятии"></textarea>
    </label>

    <label class="form-field">
      <span class="form-label">Адрес страницы</span>
      <input v-model="form.slug" class="input" type="text" :placeholder="autoSlug || 'создастся из названия'" pattern="[a-z0-9\-]*" maxlength="60">
      <span class="hint" :class="{ 'is-danger': !slugValid }">
        {{ slugValid ? `/events/${form.slug || autoSlug || '…'}${form.id ? ' — смена адреса сломает старые ссылки' : ''}` : 'Только латиница, цифры и дефис' }}
      </span>
    </label>

    <div class="form-field">
      <span class="form-label">Статус участия</span>
      <div class="choice-row" role="radiogroup" aria-label="Статус участия">
        <label v-for="key in MAIN_STATUSES" :key="key" class="choice">
          <input v-model="form.attendance_status" type="radio" :value="key">
          <i :class="ATTENDANCE[key].icon"></i>{{ ATTENDANCE[key].label }}
        </label>
      </div>
    </div>

    <div class="form-field">
      <span class="form-label">Дополнительные роли</span>
      <div class="choice-row">
        <label v-for="key in ROLE_STATUSES" :key="key" class="choice">
          <input v-model="form.attendance_roles" type="checkbox" :value="key">
          <i :class="ATTENDANCE[key].icon"></i>{{ ATTENDANCE[key].label }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { EVENT_FORM_KEY, MAIN_STATUSES, ROLE_STATUSES } from '@/composables/useEventForm.js'
import { notify } from '@/composables/useAdminNotify.js'
import { ATTENDANCE, EVENT_TYPES } from '@/utils/eventUtils.js'
import ImageUploader from '../ImageUploader.vue'

const { form, rangeValid, slugValid, autoSlug } = inject(EVENT_FORM_KEY)
</script>
