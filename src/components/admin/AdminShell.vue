<template>
  <div v-if="checking" class="login"><div class="spinner" role="status" aria-label="Проверка сессии"></div></div>

  <div v-else-if="!authenticated" class="login">
    <form class="card login-card" @submit.prevent="login">
      <span class="icon-badge"><i :class="icon"></i></span>
      <div>
        <h1>{{ brand }}</h1>
        <p class="text-muted">{{ subtitle }}</p>
      </div>

      <label class="field">
        <i class="fas fa-key"></i>
        <input v-model="code" type="password" placeholder="Код доступа" autocomplete="current-password" aria-label="Код доступа" autofocus>
      </label>

      <p v-if="error" class="alert-error" role="alert"><i class="fas fa-exclamation-triangle"></i>{{ error }}</p>

      <button type="submit" class="btn btn-primary" :disabled="!code.trim() || busy">
        <span v-if="busy" class="spinner spinner-sm"></span>
        <span v-else><i class="fas fa-sign-in-alt"></i></span>
        Войти
      </button>
      <router-link to="/" class="btn"><i class="fas fa-arrow-left"></i> На главную</router-link>
    </form>
  </div>

  <div v-else class="console">
    <aside class="card console-side">
      <div class="side-brand">
        <span class="icon-badge"><i :class="icon"></i></span>
        <div>
          <strong>{{ brand }}</strong>
          <small>Панель управления</small>
        </div>
      </div>

      <nav v-for="group in groups" :key="group.title" class="side-nav" :aria-label="group.title">
        <h2 class="side-title">{{ group.title }}</h2>
        <button
          v-for="item in group.items"
          :key="item.id"
          type="button"
          class="side-link"
          :class="{ active: modelValue === item.id }"
          :aria-current="modelValue === item.id ? 'page' : undefined"
          @click="$emit('update:modelValue', item.id)"
        >
          <i :class="item.icon"></i>
          <span>{{ item.name }}</span>
          <span v-if="item.count" class="side-count">{{ item.count }}</span>
        </button>
      </nav>

      <nav class="side-nav" aria-label="Разделы">
        <h2 class="side-title">Разделы</h2>
        <router-link to="/admin" class="side-link"><i class="fas fa-images"></i><span>Админка галереи</span></router-link>
        <router-link to="/events/admin" class="side-link"><i class="fas fa-calendar-check"></i><span>Админка мероприятий</span></router-link>
        <router-link to="/" class="side-link"><i class="fas fa-home"></i><span>На сайт</span></router-link>
      </nav>

      <div class="side-foot">
        <slot name="side-actions" />
        <button type="button" class="btn" title="Выйти" @click="logout"><i class="fas fa-sign-out-alt"></i> Выйти</button>
      </div>
    </aside>

    <main class="console-main">
      <header class="console-head">
        <div>
          <h1 class="section-title">{{ title }}</h1>
          <p>{{ subtitle }}</p>
        </div>
        <div class="btn-actions"><slot name="head-actions" /></div>
      </header>

      <slot />
    </main>
  </div>

  <Teleport to="body">
    <div class="toast-stack" aria-live="polite">
      <Transition name="toast">
        <div v-if="toast.show" :key="toast.id" class="toast" :class="`is-${toast.type}`" role="status">
          <i :class="TOAST_ICONS[toast.type] || TOAST_ICONS.info"></i>
          <span class="grow">{{ toast.message }}</span>
          <button type="button" class="icon-btn icon-btn-sm" aria-label="Закрыть уведомление" @click="hideToast"><i class="fas fa-times"></i></button>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'
import { useAdminSession } from '@/composables/useAdminSession.js'
import { hideToast, notify, toast } from '@/composables/useAdminNotify.js'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  brand: { type: String, default: 'Fox Admin' },
  icon: { type: String, default: 'fas fa-paw' },
  // [{ title, items: [{ id, name, icon, count }] }]
  groups: { type: Array, default: () => [] },
  modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue', 'ready'])

const TOAST_ICONS = {
  success: 'fas fa-check-circle',
  error: 'fas fa-exclamation-circle',
  warning: 'fas fa-exclamation-triangle',
  info: 'fas fa-info-circle'
}

const { authenticated, checking, busy, code, error, login, logout } =
  useAdminSession({ onExpired: () => notify('Сессия истекла, войдите снова', 'warning') })

// Данные страницы загружаются только после входа
watch(authenticated, (value) => { if (value) emit('ready') })
</script>
