<template>
  <div class="stack">
    <label class="switch">
      <input v-model="form.review_completed" type="checkbox" role="switch">
      <span>Обзор готов к публикации</span>
    </label>

    <div class="stack">
      <h4>Оценки <span class="status-pill is-gold"><i class="fas fa-star"></i>{{ overall ? overall.toFixed(1) : '—' }}</span></h4>
      <div v-for="category in ratingCategories" :key="category.key" class="row is-between">
        <span>{{ category.label }}</span>
        <span class="row" role="radiogroup" :aria-label="category.label">
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            class="star-btn"
            :class="{ 'is-on': form[category.key] >= n }"
            :aria-label="`${n} из 5`"
            :aria-pressed="form[category.key] === n"
            @click="form[category.key] = form[category.key] === n ? null : n"
          ><i class="fas fa-star"></i></button>
        </span>
      </div>
    </div>

    <div class="form-grid">
      <div v-for="list in LISTS" :key="list.key" class="form-field">
        <span class="form-label"><i :class="list.icon"></i> {{ list.label }}</span>
        <div v-for="(item, index) in form[list.key]" :key="index" class="row">
          <input v-model="form[list.key][index]" class="input grow" type="text" :placeholder="list.placeholder" :aria-label="`${list.label} ${index + 1}`">
          <button type="button" class="icon-btn icon-btn-sm" :aria-label="`Удалить: ${list.label} ${index + 1}`" @click="form[list.key].splice(index, 1)"><i class="fas fa-times"></i></button>
        </div>
        <button type="button" class="btn btn-sm" @click="form[list.key].push('')"><i class="fas fa-plus"></i> Добавить</button>
      </div>
    </div>

    <label class="form-field">
      <span class="form-label">Общее впечатление</span>
      <textarea v-model="form.my_review" class="input" rows="4" placeholder="Что понравилось, что запомнилось"></textarea>
    </label>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { EVENT_FORM_KEY } from '@/composables/useEventForm.js'

const LISTS = [
  { key: 'pros', label: 'Плюсы', icon: 'fas fa-thumbs-up text-success', placeholder: 'Что хорошо' },
  { key: 'cons_text', label: 'Минусы', icon: 'fas fa-thumbs-down text-danger', placeholder: 'Что улучшить' }
]

const { form, ratingCategories, overall } = inject(EVENT_FORM_KEY)
</script>
