<template>
  <div class="events-admin">
    <!-- Авторизация -->
    <div v-if="!isAuthenticated" class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo-icon">
            <i class="fas fa-calendar-star"></i>
          </div>
          <h2>Админ мероприятий</h2>
          <p>Управление событиями FoxTaffy.gay</p>
        </div>

        <form @submit.prevent="authenticate" class="auth-form">
          <div class="form-group">
            <div class="input-wrapper">
              <i class="fas fa-key input-icon"></i>
              <input
                id="authCode"
                v-model="authCode"
                type="password"
                placeholder="Введите код доступа..."
                :class="{ 'error': authError }"
                autocomplete="current-password"
              >
            </div>
          </div>

          <div v-if="authError" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            {{ authError }}
          </div>

          <button type="submit" class="auth-button" :disabled="!authCode.trim()">
            <i class="fas fa-sign-in-alt"></i>
            Войти
          </button>
        </form>

        <div class="auth-footer">
          <router-link to="/" class="back-link">
            <i class="fas fa-arrow-left"></i>
            На главную
          </router-link>
          <router-link to="/admin" class="admin-link">
            <i class="fas fa-cog"></i>
            Основная панель
          </router-link>
        </div>
      </div>
    </div>

    <!-- Основная панель -->
    <div v-else class="admin-dashboard">

      <!-- Боковая панель -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <i class="fas fa-calendar-star"></i>
          </div>
          <div class="sidebar-brand">
            <h2>Events Admin</h2>
            <span class="sidebar-version">v1.0</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <h3 class="nav-section-title">Панель</h3>
            <button class="nav-item active">
              <i class="fas fa-calendar-alt"></i>
              <span>Мероприятия</span>
            </button>
          </div>

          <div class="nav-section">
            <h3 class="nav-section-title">Навигация</h3>
            <router-link to="/events" class="nav-item nav-link">
              <i class="fas fa-eye"></i>
              <span>Просмотр на сайте</span>
            </router-link>
            <router-link to="/admin" class="nav-item nav-link">
              <i class="fas fa-shield-alt"></i>
              <span>Основная админка</span>
            </router-link>
            <router-link to="/" class="nav-item nav-link">
              <i class="fas fa-home"></i>
              <span>На главную</span>
            </router-link>
          </div>
        </nav>

        <div class="sidebar-footer">
          <button @click="logout" class="footer-logout-btn" title="Выйти">
            <i class="fas fa-sign-out-alt"></i>
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      <!-- Основной контент -->
      <main class="dashboard-main">
        <AdminEventsPanel @notification="showNotification" />
      </main>

      <!-- Уведомления -->
      <Transition name="notify">
        <div v-if="notification" class="notification" :class="notification.type">
          <div class="notification-content">
            <i :class="getNotificationIcon(notification.type)"></i>
            <span>{{ notification.message }}</span>
          </div>
          <button @click="hideNotification" class="notification-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script>
import AdminEventsPanel from '../AdminEventsPanel.vue'

const ADMIN_CODE = import.meta.env.VITE_ADMIN_SECRET_CODE || 'defaultpass'

export default {
  name: 'EventsAdmin',

  components: {
    AdminEventsPanel
  },

  data() {
    return {
      isAuthenticated: false,
      authCode: '',
      authError: '',
      notification: null,
      notificationTimeout: null
    }
  },

  mounted() {
    const savedAuth = localStorage.getItem('fox_events_admin_auth')
    if (savedAuth === 'true') {
      this.isAuthenticated = true
    }
    document.title = 'Админ мероприятий | FoxTaffy.gay'
  },

  methods: {
    authenticate() {
      if (this.authCode === ADMIN_CODE) {
        this.isAuthenticated = true
        this.authError = ''
        localStorage.setItem('fox_events_admin_auth', 'true')
        this.showNotification('Авторизация успешна!', 'success')
      } else {
        this.authError = 'Неверный код доступа!'
        this.authCode = ''
        setTimeout(() => { this.authError = '' }, 3000)
      }
    },

    logout() {
      this.isAuthenticated = false
      this.authCode = ''
      localStorage.removeItem('fox_events_admin_auth')
      this.showNotification('Вы вышли из системы', 'info')
    },

    showNotification(message, type = 'info') {
      if (this.notificationTimeout) clearTimeout(this.notificationTimeout)
      this.notification = { message, type }
      this.notificationTimeout = setTimeout(() => this.hideNotification(), 5000)
    },

    hideNotification() {
      this.notification = null
      if (this.notificationTimeout) clearTimeout(this.notificationTimeout)
    },

    getNotificationIcon(type) {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      }
      return icons[type] || 'fas fa-info-circle'
    }
  }
}
</script>

<style scoped>
/* ── CSS переменные ── */
:root {
  --bg-primary: #111114;
  --bg-secondary: #1a1a1f;
  --bg-card: rgba(255,255,255,0.04);
  --text-light: #f2f2f7;
  --text-muted: #8e8e9a;
  --accent-orange: #ff7b25;
  --accent-green: #4caf50;
  --border-light: rgba(255,255,255,0.08);
  --sidebar-width: 240px;
}

.events-admin {
  min-height: 100vh;
  background: var(--bg-primary);
  font-family: 'Nunito', sans-serif;
}

/* ─── AUTH ─── */
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background:
    radial-gradient(circle at 20% 80%, rgba(255, 123, 37, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
    #111114;
}

.auth-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 1.5rem;
  padding: 3rem;
  max-width: 420px;
  width: 100%;
  backdrop-filter: blur(20px);
  box-shadow: 0 24px 60px rgba(0,0,0,0.4);
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-icon {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, rgba(255,123,37,0.2), rgba(76,175,80,0.2));
  border: 1px solid rgba(255,123,37,0.3);
  border-radius: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--accent-orange);
  margin: 0 auto 1.25rem;
}

.auth-header h2 {
  font-size: 1.8rem;
  font-weight: 800;
  background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.4rem;
}

.auth-header p {
  color: var(--text-muted);
  font-size: 0.95rem;
}

.auth-form {
  margin-bottom: 2rem;
}

.form-group { margin-bottom: 1.25rem; }

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 0.9rem;
}

.input-wrapper input {
  width: 100%;
  padding: 0.9rem 1rem 0.9rem 2.8rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.75rem;
  color: var(--text-light);
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.25s ease;
  box-sizing: border-box;
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--accent-orange);
  background: rgba(255,255,255,0.08);
  box-shadow: 0 0 0 3px rgba(255,123,37,0.15);
}

.input-wrapper input.error {
  border-color: #ff453a;
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.error-message {
  color: #ff6b6b;
  background: rgba(255,69,58,0.1);
  border: 1px solid rgba(255,69,58,0.2);
  border-radius: 0.6rem;
  padding: 0.7rem 1rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.auth-button {
  width: 100%;
  padding: 0.9rem;
  background: linear-gradient(135deg, var(--accent-orange), #ff9f55);
  border: none;
  border-radius: 0.75rem;
  color: white;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: all 0.25s ease;
  box-shadow: 0 4px 20px rgba(255,123,37,0.35);
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(255,123,37,0.45);
}

.auth-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.auth-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.back-link,
.admin-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.back-link:hover { color: var(--text-light); }
.admin-link:hover { color: var(--accent-orange); }

/* ─── DASHBOARD LAYOUT ─── */
.admin-dashboard {
  display: flex;
  min-height: 100vh;
}

/* ─── SIDEBAR ─── */
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: rgba(255,255,255,0.03);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 50;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid var(--border-light);
}

.sidebar-logo {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(255,123,37,0.25), rgba(76,175,80,0.2));
  border: 1px solid rgba(255,123,37,0.35);
  border-radius: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: var(--accent-orange);
  flex-shrink: 0;
}

.sidebar-brand h2 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-light);
  margin: 0;
  line-height: 1.2;
}

.sidebar-version {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 500;
}

.sidebar-nav {
  flex: 1;
  padding: 1.25rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.nav-section-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin: 0 0 0.5rem 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.9rem;
  border-radius: 0.6rem;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  text-decoration: none;
  transition: all 0.2s ease;
  font-family: inherit;
}

.nav-item:hover {
  background: rgba(255,255,255,0.06);
  color: var(--text-light);
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(255,123,37,0.2), rgba(255,123,37,0.1));
  color: var(--accent-orange);
  border: 1px solid rgba(255,123,37,0.25);
}

.nav-item i {
  width: 1.1rem;
  text-align: center;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 1rem 0.75rem;
  border-top: 1px solid var(--border-light);
}

.footer-logout-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.9rem;
  width: 100%;
  background: rgba(255, 69, 58, 0.08);
  border: 1px solid rgba(255, 69, 58, 0.15);
  border-radius: 0.6rem;
  color: #ff6b6b;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.footer-logout-btn:hover {
  background: rgba(255, 69, 58, 0.15);
  border-color: rgba(255, 69, 58, 0.3);
  color: #ff453a;
}

/* ─── MAIN CONTENT ─── */
.dashboard-main {
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
}

/* ─── NOTIFICATIONS ─── */
.notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: rgba(30,30,36,0.95);
  border-radius: 0.8rem;
  padding: 1rem 1.25rem;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1000;
  max-width: 380px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.4);
}

.notification.success { border-color: rgba(76,175,80,0.4); }
.notification.error   { border-color: rgba(255,69,58,0.4); }
.notification.warning { border-color: rgba(255,149,0,0.4); }
.notification.info    { border-color: rgba(0,122,255,0.4); }

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-light);
  font-weight: 600;
  font-size: 0.9rem;
}

.notification.success .notification-content i { color: var(--accent-green); }
.notification.error   .notification-content i { color: #ff453a; }
.notification.warning .notification-content i { color: #ff9500; }
.notification.info    .notification-content i { color: #007aff; }

.notification-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.3rem;
  transition: all 0.2s ease;
  margin-left: auto;
  flex-shrink: 0;
}

.notification-close:hover {
  color: var(--text-light);
  background: rgba(255,255,255,0.1);
}

.notify-enter-active,
.notify-leave-active {
  transition: all 0.3s ease;
}

.notify-enter-from,
.notify-leave-to {
  transform: translateY(1rem);
  opacity: 0;
}

/* ─── RESPONSIVE ─── */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .dashboard-main {
    width: 100%;
  }

  .auth-card {
    padding: 2rem 1.5rem;
  }

  .notification {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}
</style>
