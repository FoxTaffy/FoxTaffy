<template>
    <div class="debt-payment-section" v-scroll-animation>
      <div class="section-header">
        <div class="header-content">
          <h2 class="section-title">Поддержка проекта</h2>
        </div>
      </div>
  
      <div class="debt-content">
        <!-- Текущее состояние долгов -->
        <div class="debt-status-card">
          <div class="status-header">
            <h3 class="status-title">
              <i class="fas fa-chart-line"></i>
              Текущее состояние
            </h3>
            <div class="status-badge" :class="getStatusClass()">
              {{ getStatusText() }}
            </div>
          </div>
          
          <!-- Прогресс бар -->
          <div class="progress-container">
            <div class="progress-info">
              <span class="progress-label">Собрано</span>
              <span class="progress-amounts">
                {{ formatAmount(currentAmount) }} / {{ formatAmount(targetAmount) }}
              </span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
            <div class="progress-percentage">{{ progressPercentage }}%</div>
          </div>
  
          <!-- Детали долгов -->
          <div class="debt-details">
            <h4 class="details-title">Основные статьи расходов:</h4>
            <div class="debt-items">
              <div 
                v-for="item in debtItems" 
                :key="item.id"
                class="debt-item"
                :class="{ 'paid': item.isPaid }"
              >
                <div class="item-icon">
                  <i :class="item.icon"></i>
                </div>
                <div class="item-content">
                  <h5 class="item-title">{{ item.title }}</h5>
                  <p class="item-description">{{ item.description }}</p>
                </div>
                <div class="item-amount">
                  <span class="amount">{{ formatAmount(item.amount) }}</span>
                  <div class="item-status">
                    <i v-if="item.isPaid" class="fas fa-check-circle paid-icon"></i>
                    <i v-else class="fas fa-clock pending-icon"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- QR-код и способы поддержки -->
        <div class="donation-card">
          <div class="donation-header">
            <h3 class="donation-title">
              <i class="fas fa-heart"></i>
              Способы поддержки
            </h3>
            <p class="donation-subtitle">
              Каждый рубль приближает к цели!
            </p>
          </div>
  
          <div class="donation-methods">
            <!-- QR-код -->
            <div class="qr-section">
              <div class="qr-container">
                <div class="qr-code">
                  <img 
                    :src="qrCodeImage" 
                    alt="QR-код для пожертвований"
                    class="qr-image"
                  />
                  <div class="qr-overlay">
                    <i class="fas fa-qrcode"></i>
                  </div>
                </div>
                <div class="qr-info">
                  <h4 class="qr-title">Быстрая поддержка через Т-банк
                  </h4>
                  <p class="qr-description">Наведите камеру на QR-код для быстрого перевода</p>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Мотивационное сообщение -->
          <div class="motivation-block">
            <!-- Последние поддержавшие (если есть) -->
            <div v-if="recentSupporters.length > 0" class="recent-supporters">
              <h5 class="supporters-title">Недавно поддержали:</h5>
              <div class="supporters-list">
                <div 
                  v-for="supporter in recentSupporters" 
                  :key="supporter.id"
                  class="supporter-item"
                  :title="supporter.message"
                >
                  <div class="supporter-avatar">
                    <i :class="supporter.icon"></i>
                  </div>
                  <div class="supporter-info">
                    <span class="supporter-name">{{ supporter.name }}</span>
                    <span class="supporter-amount">{{ formatAmount(supporter.amount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  
  // Интерфейсы для типизации данных
  interface DebtItem {
    id: number
    title: string
    description: string
    amount: number
    isPaid: boolean
    icon: string
  }
  
  interface DonationMethod {
    id: number
    name: string
    description: string
    url: string
    icon: string
  }
  
  interface Supporter {
    id: number
    name: string
    amount: number
    message: string
    icon: string
  }
  
  // Реактивные данные компонента
  const currentAmount = ref<number>(45000) // Текущая сумма в рублях
  const targetAmount = ref<number>(500000) // Целевая сумма в рублях
  
  // URL для QR-кода (можно использовать сгенерированный QR-код)
  const qrCodeImage = ref<string>('https://plugjsubjcfblzkabjia.supabase.co/storage/v1/object/public/621//QR.png')
  
  // Список долгов/целей
  const debtItems = ref<DebtItem[]>([
    {
      id: 1,
      title: 'Билеты',
      description: 'Коны на которых я был и покупал билеты, мерч, товары',
      amount: 48000,
      isPaid: false,
      icon: 'fas fa-mask'
    },
    {
      id: 2,
      title: 'Транспортные расходы',
      description: 'Поездки на мероприятия: билеты, проживание, питание',
      amount: 13000,
      isPaid: true,
      icon: 'fas fa-plane'
    },
    {
      id: 3,
      title: 'Транспортные расходы',
      description: 'Поездки на мероприятия: билеты, проживание, питание',
      amount: 13000,
      isPaid: true,
      icon: 'fas fa-plane'
    },
    {
      id: 4,
      title: 'Оборудование для стримов',
      description: 'Камера, микрофон, освещение для качественного контента',
      amount: 10000,
      isPaid: false,
      icon: 'fas fa-video'
    }
  ])
  
  // Последние поддержавшие (пример данных)
  const recentSupporters = ref<Supporter[]>([
    {
      id: 1,
      name: 'Felix',
      amount: 1000,
      message: 'Удачи с фурсьютом!',
      icon: 'fas fa-cat'
    },
    {
      id: 2,
      name: 'Anonymous',
      amount: 500,
      message: 'Спасибо за контент!',
      icon: 'fas fa-user'
    }
  ])
  
  // Вычисляемые свойства
  const progressPercentage = computed((): number => {
    const percentage = (currentAmount.value / targetAmount.value) * 100
    return Math.min(Math.round(percentage), 100)
  })
  
  const getStatusClass = (): string => {
    const percentage = progressPercentage.value
    if (percentage >= 100) return 'completed'
    if (percentage >= 75) return 'almost-done'
    if (percentage >= 50) return 'in-progress'
    return 'starting'
  }
  
  const getStatusText = (): string => {
    const percentage = progressPercentage.value
    if (percentage >= 100) return 'Цель достигнута!'
    if (percentage >= 75) return 'Почти готово'
    if (percentage >= 50) return 'На полпути'
    return 'Только начали'
  }
  
  // Вспомогательные функции
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }
  
  // Хук жизненного цикла для инициализации
  onMounted(() => {
    // Здесь можно загрузить актуальные данные с сервера
    console.log('Компонент погашения долгов инициализирован')
  })
  </script>
  
  <style scoped>

  </style>