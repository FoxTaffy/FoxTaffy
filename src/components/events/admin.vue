<template>
    <div class="events-admin">
      <!-- Авторизация -->
      <div v-if="!isAuthenticated" class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <div class="logo">🎪</div>
            <h2>Админ мероприятий</h2>
            <p>Управление событиями FoxTaffy.gay</p>
          </div>
          
          <form @submit.prevent="authenticate" class="auth-form">
            <div class="form-group">
              <label for="authCode">Код доступа:</label>
              <input 
                id="authCode"
                v-model="authCode" 
                type="password" 
                placeholder="Введите код доступа..."
                :class="{ 'error': authError }"
                autocomplete="current-password"
              >
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
              Основная админ-панель
            </router-link>
          </div>
        </div>
      </div>
  
      <!-- Основная панель -->
      <div v-else class="admin-dashboard">
        <!-- Шапка -->
        <div class="dashboard-header">
          <div class="header-left">
            <div class="logo-section">
              <div class="logo">🎪</div>
              <div>
                <h1>Админ мероприятий</h1>
                <p>Управление событиями и конвентами</p>
              </div>
            </div>
          </div>
          
          <div class="header-actions">
            <router-link to="/events" class="header-btn">
              <i class="fas fa-eye"></i>
              Посмотреть на сайте
            </router-link>
            <router-link to="/admin" class="header-btn secondary">
              <i class="fas fa-cog"></i>
              Основная админка
            </router-link>
            <button @click="logout" class="header-btn danger">
              <i class="fas fa-sign-out-alt"></i>
              Выйти
            </button>
          </div>
        </div>
  
        <!-- Основной контент -->
        <div class="dashboard-content">
          <AdminEventsPanel @notification="showNotification" />
        </div>
  
        <!-- Уведомления -->
        <div v-if="notification" class="notification" :class="notification.type">
          <div class="notification-content">
            <i :class="getNotificationIcon(notification.type)"></i>
            <span>{{ notification.message }}</span>
          </div>
          <button @click="hideNotification" class="notification-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
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
        // Авторизация
        isAuthenticated: false,
        authCode: '',
        authError: '',
        
        // Уведомления
        notification: null,
        notificationTimeout: null
      }
    },
    
    mounted() {
      // Проверяем сохранённую авторизацию
      const savedAuth = localStorage.getItem('fox_events_admin_auth')
      if (savedAuth === 'true') {
        this.isAuthenticated = true
      }
      
      // Устанавливаем заголовок страницы
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
          
          // Анимация ошибки
          setTimeout(() => {
            this.authError = ''
          }, 3000)
        }
      },
      
      logout() {
        this.isAuthenticated = false
        this.authCode = ''
        localStorage.removeItem('fox_events_admin_auth')
        this.showNotification('Вы вышли из системы', 'info')
      },
      
      // Система уведомлений
      showNotification(message, type = 'info') {
        // Очищаем предыдущее уведомление
        if (this.notificationTimeout) {
          clearTimeout(this.notificationTimeout)
        }
        
        this.notification = { message, type }
        
        // Автоматически скрываем через 5 секунд
        this.notificationTimeout = setTimeout(() => {
          this.hideNotification()
        }, 5000)
      },
      
      hideNotification() {
        this.notification = null
        if (this.notificationTimeout) {
          clearTimeout(this.notificationTimeout)
        }
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
  .events-admin {
    min-height: 100vh;
    background: linear-gradient(135deg, var(--bg-primary), #1a1a1a);
    font-family: 'Nunito', sans-serif;
  }
  
  /* Авторизация */
  .auth-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    background: 
      radial-gradient(circle at 20% 80%, rgba(255, 123, 37, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
      linear-gradient(135deg, var(--bg-primary), #1a1a1a);
  }
  
  .auth-card {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 1.5rem;
    padding: 3rem;
    max-width: 450px;
    width: 100%;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
  
  .auth-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .logo {
    font-size: 3rem;
    margin-bottom: 1rem;
    animation: bounce 2s ease-in-out infinite;
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
  
  .auth-header h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-light);
    margin-bottom: 0.5rem;
    background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .auth-header p {
    color: var(--text-muted);
    font-size: 1.1rem;
  }
  
  .auth-form {
    margin-bottom: 2rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--text-muted);
    font-weight: 600;
  }
  
  .form-group input {
    width: 100%;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.8rem;
    color: var(--text-light);
    font-size: 1rem;
    transition: all 0.3s ease;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: var(--accent-orange);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(255, 123, 37, 0.1);
  }
  
  .form-group input.error {
    border-color: #ff453a;
    animation: shake 0.5s ease-in-out;
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  .error-message {
    color: #ff453a;
    background: rgba(255, 69, 58, 0.1);
    padding: 0.8rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    border: 1px solid rgba(255, 69, 58, 0.2);
  }
  
  .auth-button {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
    border: none;
    border-radius: 0.8rem;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .auth-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 123, 37, 0.3);
  }
  
  .auth-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .auth-footer {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }
  
  .back-link,
  .admin-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.3s ease;
  }
  
  .back-link:hover,
  .admin-link:hover {
    color: var(--accent-orange);
  }
  
  /* Основная панель */
  .admin-dashboard {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .dashboard-header {
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1.5rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    backdrop-filter: blur(20px);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .header-left {
    display: flex;
    align-items: center;
  }
  
  .logo-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .logo-section .logo {
    font-size: 2.5rem;
    animation: none;
  }
  
  .logo-section h1 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-light);
    margin: 0;
    background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .logo-section p {
    color: var(--text-muted);
    margin: 0;
    font-size: 0.9rem;
  }
  
  .header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  
  .header-btn {
    padding: 0.6rem 1rem;
    border-radius: 0.5rem;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: none;
    cursor: pointer;
    background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
    color: white;
  }
  
  .header-btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-light);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .header-btn.danger {
    background: linear-gradient(45deg, #ff453a, #ff6347);
    color: white;
  }
  
  .header-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
  
  .header-btn.secondary:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .dashboard-content {
    flex: 1;
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }
  
  /* Уведомления */
  .notification {
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.8rem;
    padding: 1rem 1.5rem;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
    z-index: 1000;
    animation: slideInRight 0.3s ease;
    max-width: 400px;
  }
  
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .notification.success {
    border-color: rgba(76, 175, 80, 0.3);
    background: rgba(76, 175, 80, 0.1);
  }
  
  .notification.error {
    border-color: rgba(255, 69, 58, 0.3);
    background: rgba(255, 69, 58, 0.1);
  }
  
  .notification.warning {
    border-color: rgba(255, 149, 0, 0.3);
    background: rgba(255, 149, 0, 0.1);
  }
  
  .notification.info {
    border-color: rgba(0, 122, 255, 0.3);
    background: rgba(0, 122, 255, 0.1);
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    color: var(--text-light);
    font-weight: 500;
  }
  
  .notification.success .notification-content i {
    color: var(--accent-green);
  }
  
  .notification.error .notification-content i {
    color: #ff453a;
  }
  
  .notification.warning .notification-content i {
    color: #ff9500;
  }
  
  .notification.info .notification-content i {
    color: #007aff;
  }
  
  .notification-close {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0.2rem;
    border-radius: 0.3rem;
    transition: all 0.2s ease;
  }
  
  .notification-close:hover {
    color: var(--text-light);
    background: rgba(255, 255, 255, 0.1);
  }
  
  /* Адаптивность */
  @media (max-width: 768px) {
    .auth-container {
      padding: 1rem;
    }
    
    .auth-card {
      padding: 2rem;
    }
    
    .dashboard-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
      padding: 1rem;
    }
    
    .header-actions {
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .dashboard-content {
      padding: 1rem;
    }
    
    .notification {
      top: 1rem;
      right: 1rem;
      left: 1rem;
      max-width: none;
    }
    
    .auth-footer {
      flex-direction: column;
      text-align: center;
    }
  }
  
  /* CSS переменные */
  :root {
    --bg-primary: #1a1a1a;
    --bg-secondary: #222222;
    --text-light: #f2f2f2;
    --text-muted: #a0a0a0;
    --accent-orange: #ff7b25;
    --accent-green: #4caf50;
  }
  </style>