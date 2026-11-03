<template>
  <article
    class="card media-card"
    :class="{ 'is-upcoming': upcoming, 'is-locked': locked }"
    :tabindex="locked ? -1 : 0"
    :aria-disabled="locked || undefined"
    @click="$emit('open', event)"
    @keydown.enter.self="$emit('open', event)"
  >
    <div class="media-card-img">
      <img v-if="image && !imageFailed" :src="image" :alt="event.name" loading="lazy" @error="imageFailed = true">
      <div v-else class="media-card-placeholder"><i class="fas fa-calendar-alt"></i></div>

      <div class="corner-tl date-chip">
        <template v-if="event.event_type === 'convention' && event.event_end_date">
          <strong>{{ formatDateRange(event.event_date, event.event_end_date) }}</strong>
        </template>
        <template v-else>
          <small>{{ date.month }}</small>
          <strong>{{ date.day }}</strong>
          <span>{{ date.year }}</span>
        </template>
      </div>

      <span v-if="rating" class="corner-tr status-pill is-gold">
        <i class="fas fa-star"></i>{{ rating.toFixed(1) }}
      </span>

      <div v-if="attendance.length" class="corner-bl">
        <span v-for="key in attendance" :key="key" class="status-pill" :class="'is-' + ATTENDANCE[key].tone">
          <i :class="ATTENDANCE[key].icon"></i>{{ ATTENDANCE[key].label }}
        </span>
      </div>
    </div>

    <div class="media-card-body">
      <h3 class="media-card-title">{{ event.name }}</h3>

      <div class="media-card-meta">
        <span><i class="fas fa-map-marker-alt"></i>{{ event.city || event.location || 'Место уточняется' }}</span>
        <span v-if="event.attendees_count"><i class="fas fa-users"></i>{{ event.attendees_count }}+</span>
      </div>

      <p class="media-card-text">{{ eventDescription(event) }}</p>

      <div v-if="event.con_features?.length" class="tag-row">
        <span v-for="feature in event.con_features.slice(0, 3)" :key="feature.id" class="tag">{{ feature.title }}</span>
        <span v-if="event.con_features.length > 3" class="tag">+{{ event.con_features.length - 3 }}</span>
      </div>

      <div v-if="upcoming" class="media-card-footer">
        <div>
          <span>До начала: <b>{{ countdownLabel(event) }}</b></span>
          <progress class="meter" :value="countdownProgress(event)" max="100"></progress>
        </div>
      </div>

      <div v-else class="media-card-footer">
        <div v-if="event.photoPreviews?.length" class="thumb-row">
          <button
            v-for="(photo, index) in event.photoPreviews.slice(0, 3)"
            :key="photo.id"
            type="button"
            class="thumb"
            :aria-label="`Открыть фото ${index + 1}`"
            @click.stop="$emit('photos', event, index)"
          >
            <img :src="photo.thumbnail_url || photo.image_url" alt="" loading="lazy">
          </button>
          <button
            v-if="event.photos_count > 3"
            type="button"
            class="thumb thumb-more"
            :aria-label="`Все фото: ${event.photos_count}`"
            @click.stop="$emit('photos', event, 3)"
          >
            <img v-if="event.photoPreviews[3]" :src="event.photoPreviews[3].thumbnail_url || event.photoPreviews[3].image_url" alt="">
            <span>+{{ event.photos_count - 3 }}</span>
          </button>
        </div>
        <span v-else-if="event.photos_count"><i class="fas fa-images"></i> {{ photosLabel(event.photos_count) }}</span>

        <span v-if="locked"><i class="fas fa-lock"></i> Обзор ещё не написан</span>
        <span v-else class="btn btn-accent">{{ isAdmin ? 'Изменить' : 'Обзор' }} <i class="fas fa-arrow-right"></i></span>
      </div>

      <div v-if="upcoming" class="btn-actions">
        <a v-if="officialSite" :href="officialSite" class="btn btn-primary" target="_blank" rel="noopener noreferrer" @click.stop>
          <i class="fas fa-external-link-alt"></i> Сайт
        </a>
        <button type="button" class="btn" @click.stop="$emit('calendar', event)">
          <i class="fas fa-calendar-plus"></i> В календарь
        </button>
      </div>

      <slot name="actions" />
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  ATTENDANCE, countdownLabel, countdownProgress, dateParts, eventDescription, eventImage,
  formatDateRange, isReviewMissing, isUpcoming, overallRating, parseAttendance, photosLabel, safeHttpUrl
} from '@/utils/eventUtils.js'

const props = defineProps({
  event: { type: Object, required: true },
  isAdmin: { type: Boolean, default: false }
})
defineEmits(['open', 'photos', 'calendar'])

const imageFailed = ref(false)
const upcoming = computed(() => isUpcoming(props.event))
const locked = computed(() => isReviewMissing(props.event) && !props.isAdmin)
const date = computed(() => dateParts(props.event.event_date))
const image = computed(() => eventImage(props.event))
const rating = computed(() => (upcoming.value ? 0 : overallRating(props.event)))
const attendance = computed(() => parseAttendance(props.event.attendance_status))
const officialSite = computed(() => safeHttpUrl(props.event.official_website))
</script>
