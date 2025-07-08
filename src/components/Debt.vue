<template>
    <div class="financial-dashboard">
      <!-- Анимированный фон с частицами -->
      <div class="animated-background">
        <div class="particle" v-for="i in 50" :key="i" :style="getParticleStyle(i)"></div>
      </div>
      
      <!-- Главный заголовок с анимацией -->
      <header class="dashboard-header">
        <div class="header-content">
          <div class="logo-section">
            <div class="logo-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="logo-text">
              <h1>Fox Financial</h1>
              <p>Персональный финансовый помощник</p>
            </div>
          </div>
          
          <!-- Кнопка переключения темы -->
          <button @click="toggleTheme" class="theme-toggle">
            <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
          </button>
        </div>
      </header>
  
      <!-- Основной контент с навигацией -->
      <div class="dashboard-content">
        <!-- Боковая навигация -->
        <nav class="sidebar">
          <div class="nav-items">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              class="nav-item"
              :class="{ active: activeTab === tab.id }"
            >
              <i :class="tab.icon"></i>
              <span>{{ tab.label }}</span>
              <div class="nav-indicator"></div>
            </button>
          </div>
        </nav>
  
        <!-- Основная панель -->
        <main class="main-panel">
          
          <!-- 1. СТРАТЕГИЯ ПОГАШЕНИЯ ДОЛГОВ -->
          <div v-if="activeTab === 'strategy'" class="panel-content">
            <div class="panel-header">
              <h2>🎯 Стратегия погашения долгов</h2>
              <p>Оптимальный план для вашей ситуации</p>
            </div>
            
            <!-- Общая информация -->
            <div class="overview-cards">
              <div class="stat-card debt-total">
                <div class="card-icon">
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="card-content">
                  <h3>Общий долг</h3>
                  <div class="amount">{{ formatCurrency(totalDebt) }}</div>
                  <div class="trend negative">
                    <i class="fas fa-arrow-down"></i>
                    Снижаем с {{ formatCurrency(583092) }}
                  </div>
                </div>
              </div>
              
              <div class="stat-card income-total">
                <div class="card-icon">
                  <i class="fas fa-wallet"></i>
                </div>
                <div class="card-content">
                  <h3>Доход в месяц</h3>
                  <div class="amount">{{ formatCurrency(monthlyIncome) }}</div>
                  <div class="trend positive">
                    <i class="fas fa-arrow-up"></i>
                    Стабильно {{ formatCurrency(100000) }}
                  </div>
                </div>
              </div>
              
              <div class="stat-card available-funds">
                <div class="card-icon">
                  <i class="fas fa-coins"></i>
                </div>
                <div class="card-content">
                  <h3>Доступно на долги</h3>
                  <div class="amount">{{ formatCurrency(availableForDebts) }}</div>
                  <div class="trend neutral">
                    <i class="fas fa-chart-pie"></i>
                    {{ Math.round((availableForDebts / monthlyIncome) * 100) }}% от дохода
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Стратегия по долгам -->
            <div class="debt-strategy">
              <h3>📋 Рекомендуемая последовательность</h3>
              <div class="strategy-timeline">
                <div 
                  v-for="(debt, index) in debtStrategy" 
                  :key="debt.id"
                  class="strategy-item"
                  :class="{ completed: debt.completed }"
                >
                  <div class="strategy-number">{{ index + 1 }}</div>
                  <div class="strategy-content">
                    <div class="strategy-header">
                      <h4>{{ debt.name }}</h4>
                      <span class="priority-badge" :class="getPriorityClass(debt.priority)">
                        {{ debt.priority }}% годовых
                      </span>
                    </div>
                    <div class="strategy-details">
                      <div class="debt-amount">
                        <span class="label">Долг:</span>
                        <span class="value">{{ formatCurrency(debt.amount) }}</span>
                      </div>
                      <div class="monthly-payment">
                        <span class="label">Платеж:</span>
                        <span class="value">{{ formatCurrency(debt.payment) }}</span>
                      </div>
                      <div class="payoff-time">
                        <span class="label">Срок:</span>
                        <span class="value">{{ debt.months }} мес.</span>
                      </div>
                    </div>
                    <div class="strategy-progress">
                      <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: debt.progress + '%' }"></div>
                      </div>
                      <span class="progress-text">{{ debt.progress }}% погашено</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Календарь выплат -->
            <div class="payment-calendar">
              <h3>📅 Календарь выплат</h3>
              <div class="calendar-grid">
                <div 
                  v-for="month in paymentCalendar" 
                  :key="month.id"
                  class="month-card"
                >
                  <div class="month-header">
                    <h4>{{ month.name }}</h4>
                    <span class="month-total">{{ formatCurrency(month.total) }}</span>
                  </div>
                  <div class="month-payments">
                    <div 
                      v-for="payment in month.payments" 
                      :key="payment.id"
                      class="payment-item"
                    >
                      <span class="payment-date">{{ payment.date }}</span>
                      <span class="payment-name">{{ payment.name }}</span>
                      <span class="payment-amount">{{ formatCurrency(payment.amount) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 2. ОПТИМИЗАЦИЯ РАСХОДОВ -->
          <div v-if="activeTab === 'optimization'" class="panel-content">
            <div class="panel-header">
              <h2>💡 Оптимизация расходов</h2>
              <p>Найдем деньги на выплаты без жесткой экономии</p>
            </div>
            
            <!-- Анализ текущих расходов -->
            <div class="expense-analysis">
              <div class="expense-breakdown">
                <h3>📊 Анализ ваших трат</h3>
                <div class="expense-chart">
                  <div class="chart-container">
                    <canvas ref="expenseChart"></canvas>
                  </div>
                  <div class="expense-legend">
                    <div class="legend-item" v-for="expense in expenseCategories" :key="expense.id">
                      <div class="legend-color" :style="{ backgroundColor: expense.color }"></div>
                      <span class="legend-name">{{ expense.name }}</span>
                      <span class="legend-amount">{{ formatCurrency(expense.amount) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Рекомендации по экономии -->
            <div class="saving-recommendations">
              <h3>🔍 Умные способы экономии</h3>
              <div class="recommendations-grid">
                <div 
                  v-for="recommendation in savingRecommendations" 
                  :key="recommendation.id"
                  class="recommendation-card"
                  :class="recommendation.type"
                >
                  <div class="recommendation-icon">
                    <i :class="recommendation.icon"></i>
                  </div>
                  <div class="recommendation-content">
                    <h4>{{ recommendation.title }}</h4>
                    <p>{{ recommendation.description }}</p>
                    <div class="recommendation-savings">
                      <span class="savings-label">Экономия:</span>
                      <span class="savings-amount">{{ formatCurrency(recommendation.savings) }}/мес</span>
                    </div>
                    <div class="recommendation-difficulty">
                      <span class="difficulty-label">Сложность:</span>
                      <div class="difficulty-stars">
                        <i 
                          v-for="star in 5" 
                          :key="star"
                          class="fas fa-star"
                          :class="{ active: star <= recommendation.difficulty }"
                        ></i>
                      </div>
                    </div>
                  </div>
                  <button 
                    @click="applyRecommendation(recommendation)"
                    class="apply-btn"
                  >
                    Применить
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Трекер привычек -->
            <div class="habit-tracker">
              <h3>📈 Трекер финансовых привычек</h3>
              <div class="habits-grid">
                <div 
                  v-for="habit in financialHabits" 
                  :key="habit.id"
                  class="habit-card"
                >
                  <div class="habit-header">
                    <h4>{{ habit.name }}</h4>
                    <div class="habit-streak">
                      <i class="fas fa-fire"></i>
                      <span>{{ habit.streak }} дней</span>
                    </div>
                  </div>
                  <div class="habit-progress">
                    <div class="progress-circle">
                      <div class="circle-progress" :style="{ '--progress': habit.progress + '%' }">
                        <span class="progress-text">{{ habit.progress }}%</span>
                      </div>
                    </div>
                  </div>
                  <div class="habit-actions">
                    <button 
                      @click="markHabitCompleted(habit)"
                      class="habit-complete-btn"
                      :class="{ completed: habit.todayCompleted }"
                    >
                      <i class="fas fa-check"></i>
                      {{ habit.todayCompleted ? 'Выполнено' : 'Отметить' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 3. ПЕРЕГОВОРЫ С БАНКАМИ -->
          <div v-if="activeTab === 'negotiation'" class="panel-content">
            <div class="panel-header">
              <h2>🤝 Переговоры с банками</h2>
              <p>Сценарии для снижения процентных ставок</p>
            </div>
            
            <!-- Подготовка к переговорам -->
            <div class="negotiation-prep">
              <h3>📋 Подготовка к переговорам</h3>
              <div class="prep-checklist">
                <div 
                  v-for="item in negotiationChecklist" 
                  :key="item.id"
                  class="checklist-item"
                  :class="{ completed: item.completed }"
                >
                  <div class="checkbox" @click="toggleChecklistItem(item)">
                    <i class="fas fa-check"></i>
                  </div>
                  <div class="checklist-content">
                    <h4>{{ item.title }}</h4>
                    <p>{{ item.description }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Сценарии переговоров -->
            <div class="negotiation-scenarios">
              <h3>🎭 Сценарии переговоров</h3>
              <div class="scenarios-tabs">
                <button 
                  v-for="scenario in negotiationScenarios" 
                  :key="scenario.id"
                  @click="activeScenario = scenario.id"
                  class="scenario-tab"
                  :class="{ active: activeScenario === scenario.id }"
                >
                  {{ scenario.bank }}
                </button>
              </div>
              
              <div class="scenario-content">
                <div 
                  v-for="scenario in negotiationScenarios" 
                  :key="scenario.id"
                  v-show="activeScenario === scenario.id"
                  class="scenario-panel"
                >
                  <div class="scenario-header">
                    <h4>{{ scenario.bank }}</h4>
                    <div class="scenario-stats">
                      <span class="current-rate">{{ scenario.currentRate }}% → </span>
                      <span class="target-rate">{{ scenario.targetRate }}%</span>
                    </div>
                  </div>
                  
                  <div class="scenario-dialogue">
                    <h5>💬 Диалог</h5>
                    <div class="dialogue-steps">
                      <div 
                        v-for="step in scenario.dialogue" 
                        :key="step.id"
                        class="dialogue-step"
                        :class="step.speaker"
                      >
                        <div class="speaker-avatar">
                          <i :class="step.speaker === 'you' ? 'fas fa-user' : 'fas fa-headset'"></i>
                        </div>
                        <div class="dialogue-content">
                          <div class="speaker-name">{{ step.speaker === 'you' ? 'Вы' : 'Банк' }}</div>
                          <div class="dialogue-text">{{ step.text }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="scenario-tips">
                    <h5>💡 Советы</h5>
                    <ul class="tips-list">
                      <li v-for="tip in scenario.tips" :key="tip">{{ tip }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 4. ДОПОЛНИТЕЛЬНЫЙ ДОХОД -->
          <div v-if="activeTab === 'income'" class="panel-content">
            <div class="panel-header">
              <h2>💰 Дополнительный доход</h2>
              <p>Подработка под ваш ритм и навыки</p>
            </div>
            
            <!-- Анализ навыков -->
            <div class="skills-analysis">
              <h3>🎯 Анализ ваших навыков</h3>
              <div class="skills-grid">
                <div class="skill-card">
                  <div class="skill-icon">
                    <i class="fas fa-code"></i>
                  </div>
                  <div class="skill-content">
                    <h4>Веб-разработка</h4>
                    <p>Создание сайтов-биографий</p>
                    <div class="skill-level">
                      <div class="level-bar">
                        <div class="level-fill" style="width: 75%"></div>
                      </div>
                      <span>Средний уровень</span>
                    </div>
                  </div>
                </div>
                
                <div class="skill-card">
                  <div class="skill-icon">
                    <i class="fas fa-palette"></i>
                  </div>
                  <div class="skill-content">
                    <h4>Фурри-арт</h4>
                    <p>Рисование персонажей на заказ</p>
                    <div class="skill-level">
                      <div class="level-bar">
                        <div class="level-fill" style="width: 85%"></div>
                      </div>
                      <span>Высокий уровень</span>
                    </div>
                  </div>
                </div>
                
                <div class="skill-card">
                  <div class="skill-icon">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div class="skill-content">
                    <h4>Доступное время</h4>
                    <p>7 часов в неделю</p>
                    <div class="skill-level">
                      <div class="level-bar">
                        <div class="level-fill" style="width: 40%"></div>
                      </div>
                      <span>Ограниченно</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Варианты подработки -->
            <div class="income-opportunities">
              <h3>💼 Рекомендуемые варианты</h3>
              <div class="opportunities-grid">
                <div 
                  v-for="opportunity in incomeOpportunities" 
                  :key="opportunity.id"
                  class="opportunity-card"
                >
                  <div class="opportunity-header">
                    <div class="opportunity-icon">
                      <i :class="opportunity.icon"></i>
                    </div>
                    <div class="opportunity-title">
                      <h4>{{ opportunity.title }}</h4>
                      <p>{{ opportunity.description }}</p>
                    </div>
                  </div>
                  
                  <div class="opportunity-stats">
                    <div class="stat-item">
                      <span class="stat-label">Доход:</span>
                      <span class="stat-value">{{ formatCurrency(opportunity.income) }}/мес</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Время:</span>
                      <span class="stat-value">{{ opportunity.timeRequired }}ч/нед</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Сложность:</span>
                      <div class="difficulty-stars">
                        <i 
                          v-for="star in 5" 
                          :key="star"
                          class="fas fa-star"
                          :class="{ active: star <= opportunity.difficulty }"
                        ></i>
                      </div>
                    </div>
                  </div>
                  
                  <div class="opportunity-details">
                    <h5>📋 Как начать:</h5>
                    <ul class="steps-list">
                      <li v-for="step in opportunity.steps" :key="step">{{ step }}</li>
                    </ul>
                  </div>
                  
                  <div class="opportunity-platforms">
                    <h5>🌐 Платформы:</h5>
                    <div class="platforms-list">
                      <span 
                        v-for="platform in opportunity.platforms" 
                        :key="platform"
                        class="platform-tag"
                      >
                        {{ platform }}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    @click="startOpportunity(opportunity)"
                    class="start-btn"
                  >
                    Начать зарабатывать
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 5. ВИЗУАЛИЗАЦИЯ ПРОГРЕССА -->
          <div v-if="activeTab === 'progress'" class="panel-content">
            <div class="panel-header">
              <h2>📊 Визуализация прогресса</h2>
              <p>Отслеживайте свой путь к финансовой свободе</p>
            </div>
            
            <!-- Общий прогресс -->
            <div class="overall-progress">
              <div class="progress-hero">
                <div class="progress-circle-large">
                  <div class="circle-progress-large" :style="{ '--progress': overallProgress + '%' }">
                    <div class="progress-content">
                      <div class="progress-percentage">{{ overallProgress }}%</div>
                      <div class="progress-label">Общий прогресс</div>
                    </div>
                  </div>
                </div>
                <div class="progress-stats">
                  <div class="stat-item">
                    <span class="stat-label">Погашено:</span>
                    <span class="stat-value">{{ formatCurrency(totalPaid) }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Осталось:</span>
                    <span class="stat-value">{{ formatCurrency(totalDebt) }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">До цели:</span>
                    <span class="stat-value">{{ monthsToFreedom }} мес.</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Прогресс по долгам -->
            <div class="debt-progress">
              <h3>📈 Прогресс по каждому долгу</h3>
              <div class="debt-progress-grid">
                <div 
                  v-for="debt in debtsProgress" 
                  :key="debt.id"
                  class="debt-progress-card"
                >
                  <div class="debt-progress-header">
                    <h4>{{ debt.name }}</h4>
                    <span class="debt-percentage">{{ debt.progress }}%</span>
                  </div>
                  <div class="debt-progress-bar">
                    <div class="progress-fill" :style="{ width: debt.progress + '%' }"></div>
                  </div>
                  <div class="debt-progress-details">
                    <div class="detail-item">
                      <span class="detail-label">Было:</span>
                      <span class="detail-value">{{ formatCurrency(debt.original) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Осталось:</span>
                      <span class="detail-value">{{ formatCurrency(debt.remaining) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Выплачено:</span>
                      <span class="detail-value">{{ formatCurrency(debt.paid) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Мотивационные этапы -->
            <div class="motivation-milestones">
              <h3>🎯 Мотивационные этапы</h3>
              <div class="milestones-timeline">
                <div 
                  v-for="milestone in motivationMilestones" 
                  :key="milestone.id"
                  class="milestone-item"
                  :class="{ 
                    completed: milestone.completed, 
                    current: milestone.current 
                  }"
                >
                  <div class="milestone-icon">
                    <i :class="milestone.icon"></i>
                  </div>
                  <div class="milestone-content">
                    <h4>{{ milestone.title }}</h4>
                    <p>{{ milestone.description }}</p>
                    <div class="milestone-reward">
                      <span class="reward-text">{{ milestone.reward }}</span>
                    </div>
                  </div>
                  <div class="milestone-progress">
                    <div class="milestone-bar">
                      <div class="milestone-fill" :style="{ width: milestone.progress + '%' }"></div>
                    </div>
                    <span class="milestone-percentage">{{ milestone.progress }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 6. АНАЛИЗ ПРИВЫЧЕК -->
          <div v-if="activeTab === 'habits'" class="panel-content">
            <div class="panel-header">
              <h2>🔄 Анализ привычек</h2>
              <p>Замена вредных финансовых привычек на здоровые</p>
            </div>
            
            <!-- Диагностика привычек -->
            <div class="habits-diagnosis">
              <h3>🔍 Диагностика ваших привычек</h3>
              <div class="diagnosis-grid">
                <div 
                  v-for="habit in badHabits" 
                  :key="habit.id"
                  class="habit-diagnosis-card"
                  :class="habit.severity"
                >
                  <div class="habit-icon">
                    <i :class="habit.icon"></i>
                  </div>
                  <div class="habit-content">
                    <h4>{{ habit.title }}</h4>
                    <p>{{ habit.description }}</p>
                    <div class="habit-impact">
                      <span class="impact-label">Убыток:</span>
                      <span class="impact-value">{{ formatCurrency(habit.cost) }}/мес</span>
                    </div>
                  </div>
                  <div class="habit-severity">
                    <span class="severity-label">{{ habit.severityText }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Замена привычек -->
            <div class="habits-replacement">
              <h3>🔄 Замена привычек</h3>
              <div class="replacement-grid">
                <div 
                  v-for="replacement in habitReplacements" 
                  :key="replacement.id"
                  class="replacement-card"
                >
                  <div class="replacement-header">
                    <div class="before-after">
                      <div class="before">
                        <i :class="replacement.oldIcon"></i>
                        <span>{{ replacement.oldHabit }}</span>
                      </div>
                      <div class="arrow">
                        <i class="fas fa-arrow-right"></i>
                      </div>
                      <div class="after">
                        <i :class="replacement.newIcon"></i>
                        <span>{{ replacement.newHabit }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="replacement-content">
                    <h4>{{ replacement.title }}</h4>
                    <p>{{ replacement.description }}</p>
                    
                    <div class="replacement-plan">
                      <h5>📋 План замены:</h5>
                      <ul class="plan-steps">
                        <li v-for="step in replacement.steps" :key="step">{{ step }}</li>
                      </ul>
                    </div>
                    
                    <div class="replacement-benefits">
                      <h5>💰 Экономия:</h5>
                      <div class="benefits-stats">
                        <div class="benefit-item">
                          <span class="benefit-label">В месяц:</span>
                          <span class="benefit-value">{{ formatCurrency(replacement.monthlySavings) }}</span>
                        </div>
                        <div class="benefit-item">
                          <span class="benefit-label">В год:</span>
                          <span class="benefit-value">{{ formatCurrency(replacement.yearlySavings) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    @click="startReplacement(replacement)"
                    class="start-replacement-btn"
                  >
                    Начать замену
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <!-- Плавающая панель действий -->
      <div class="floating-actions">
        <button 
          @click="openQuickAdd"
          class="fab-button"
          title="Быстрое добавление"
        >
          <i class="fas fa-plus"></i>
        </button>
        <button 
          @click="openSettings"
          class="fab-button"
          title="Настройки"
        >
          <i class="fas fa-cog"></i>
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, computed, onMounted, nextTick } from 'vue'
  
  // ============================================
  // 📊 ИНТЕРФЕЙСЫ И ТИПЫ
  // ============================================
  
  interface DebtItem {
    id: string
    name: string
    amount: number
    rate: number
    payment: number
    months: number
    progress: number
    priority: number
    completed: boolean
  }
  
  interface ExpenseCategory {
    id: string
    name: string
    amount: number
    color: string
  }
  
  interface SavingRecommendation {
    id: string
    title: string
    description: string
    savings: number
    difficulty: number
    type: string
    icon: string
  }
  
  // ============================================
  // 🎯 РЕАКТИВНЫЕ ДАННЫЕ
  // ============================================
  
  // Состояние интерфейса
  const isDark = ref(true)
  const activeTab = ref('strategy')
  const activeScenario = ref('spermabank')
  
  // Финансовые данные пользователя
  const monthlyIncome = ref(100000) // 86000 + 14000
  const totalDebt = ref(583092) // Сумма всех долгов
  const totalPaid = ref(0) // Пока не выплачено
  const availableForDebts = ref(65000) // После всех расходов
  
  // Навигационные вкладки
  const tabs = ref([
    { id: 'strategy', label: 'Стратегия', icon: 'fas fa-chess' },
    { id: 'optimization', label: 'Оптимизация', icon: 'fas fa-chart-pie' },
    { id: 'negotiation', label: 'Переговоры', icon: 'fas fa-handshake' },
    { id: 'income', label: 'Доходы', icon: 'fas fa-coins' },
    { id: 'progress', label: 'Прогресс', icon: 'fas fa-chart-line' },
    { id: 'habits', label: 'Привычки', icon: 'fas fa-sync-alt' }
  ])
  
  // Стратегия погашения долгов
  const debtStrategy = ref<DebtItem[]>([
    {
      id: 'installment',
      name: 'Рассрочка',
      amount: 126392,
      rate: 60.0,
      payment: 25000,
      months: 6,
      progress: 0,
      priority: 1,
      completed: false
    },
    {
      id: 'spermabank',
      name: 'Спермбанк',
      amount: 270700,
      rate: 25.4,
      payment: 25000,
      months: 12,
      progress: 0,
      priority: 2,
      completed: false
    },
    {
      id: 'tbank',
      name: 'Т Банк',
      amount: 75000,
      rate: 23.0,
      payment: 15000,
      months: 5,
      progress: 0,
      priority: 3,
      completed: false
    },
    {
      id: 'split',
      name: 'Сплит',
      amount: 111000,
      rate: 0.0,
      payment: 15000,
      months: 8,
      progress: 0,
      priority: 4,
      completed: false
    }
  ])
  
  // Календарь выплат
  const paymentCalendar = ref([
    {
      id: 'august',
      name: 'Август 2025',
      total: 65000,
      payments: [
        { id: 1, date: '8 авг', name: 'Рассрочка', amount: 25000 },
        { id: 2, date: '9 авг', name: 'Т Банк', amount: 15000 },
        { id: 3, date: '1 авг', name: 'Спермбанк', amount: 25000 }
      ]
    },
    {
      id: 'september',
      name: 'Сентябрь 2025',
      total: 65000,
      payments: [
        { id: 1, date: '8 сен', name: 'Рассрочка', amount: 25000 },
        { id: 2, date: '9 сен', name: 'Т Банк', amount: 15000 },
        { id: 3, date: '1 сен', name: 'Спермбанк', amount: 25000 }
      ]
    }
  ])
  
  // Категории расходов
  const expenseCategories = ref<ExpenseCategory[]>([
    { id: 'subscriptions', name: 'Подписки', amount: 1828, color: '#8B5CF6' },
    { id: 'food', name: 'Еда и напитки', amount: 15000, color: '#F59E0B' },
    { id: 'transport', name: 'Транспорт', amount: 5000, color: '#10B981' },
    { id: 'entertainment', name: 'Развлечения', amount: 8000, color: '#EF4444' },
    { id: 'other', name: 'Прочее', amount: 5172, color: '#6B7280' }
  ])
  
  // Рекомендации по экономии
  const savingRecommendations = ref<SavingRecommendation[]>([
    {
      id: 'food-delivery',
      title: 'Замена доставки еды',
      description: 'Готовьте дома 4 дня в неделю вместо заказа пиццы и суши',
      savings: 8000,
      difficulty: 2,
      type: 'high-impact',
      icon: 'fas fa-utensils'
    },
    {
      id: 'energy-drinks',
      title: 'Энергетики → Кофе',
      description: 'Замените энергетики на кофе или чай для ночных смен',
      savings: 3000,
      difficulty: 3,
      type: 'medium-impact',
      icon: 'fas fa-coffee'
    },
    {
      id: 'subscriptions',
      title: 'Аудит подписок',
      description: 'Отмените неиспользуемые подписки и сервисы',
      savings: 1500,
      difficulty: 1,
      type: 'easy-win',
      icon: 'fas fa-credit-card'
    }
  ])
  
  // Список переговоров с банками
  const negotiationChecklist = ref([
    {
      id: 1,
      title: 'Собрать справки о доходах',
      description: 'Справка 2-НДФЛ за последние 6 месяцев',
      completed: false
    },
    {
      id: 2,
      title: 'Подготовить историю платежей',
      description: 'Распечатать выписку без просрочек',
      completed: false
    },
    {
      id: 3,
      title: 'Изучить предложения конкурентов',
      description: 'Узнать ставки в других банках',
      completed: false
    }
  ])
  
  // Сценарии переговоров
  const negotiationScenarios = ref([
    {
      id: 'spermabank',
      bank: 'Спермбанк',
      currentRate: 25.4,
      targetRate: 20.0,
      dialogue: [
        {
          id: 1,
          speaker: 'you',
          text: 'Здравствуйте! Я клиент банка уже 2 года, всегда плачу вовремя. Хотел бы обсудить возможность снижения ставки по кредиту.'
        },
        {
          id: 2,
          speaker: 'bank',
          text: 'Здравствуйте! Да, вижу у вас хорошая кредитная история. Какую ставку вы хотели бы обсудить?'
        },
        {
          id: 3,
          speaker: 'you',
          text: 'Я изучил предложения на рынке, в других банках ставки от 19-22%. Могли бы вы предложить аналогичные условия?'
        }
      ],
      tips: [
        'Подчеркните свою лояльность банку',
        'Приведите конкретные примеры ставок конкурентов',
        'Будьте готовы к частичному снижению ставки'
      ]
    }
  ])
  
  // Возможности дополнительного дохода
  const incomeOpportunities = ref([
    {
      id: 'websites',
      title: 'Сайты-биографии',
      description: 'Создание персональных сайтов для творческих людей',
      income: 15000,
      timeRequired: 3,
      difficulty: 2,
      icon: 'fas fa-laptop-code',
      steps: [
        'Создать портфолио из 3-5 сайтов',
        'Разместить объявления на Авито и FL.ru',
        'Найти первых клиентов через соцсети'
      ],
      platforms: ['FL.ru', 'Авито', 'Kwork', 'Фриланс.ру']
    },
    {
      id: 'furry-art',
      title: 'Фурри арт на заказ',
      description: 'Рисование персонажей для фурри-сообщества',
      income: 20000,
      timeRequired: 4,
      difficulty: 1,
      icon: 'fas fa-paint-brush',
      steps: [
        'Создать галерею работ',
        'Зарегистрироваться на FurAffinity',
        'Установить цены и начать принимать заказы'
      ],
      platforms: ['FurAffinity', 'Twitter', 'VK', 'Telegram']
    }
  ])
  
  // Финансовые привычки
  const financialHabits = ref([
    {
      id: 'daily-budget',
      name: 'Ежедневный бюджет',
      streak: 12,
      progress: 75,
      todayCompleted: false
    },
    {
      id: 'meal-prep',
      name: 'Готовка дома',
      streak: 8,
      progress: 60,
      todayCompleted: true
    },
    {
      id: 'expense-tracking',
      name: 'Учет расходов',
      streak: 25,
      progress: 85,
      todayCompleted: false
    }
  ])
  
  // Плохие привычки
  const badHabits = ref([
    {
      id: 'food-delivery',
      title: 'Заказ еды',
      description: 'Частые заказы пиццы и суши вместо готовки дома',
      cost: 12000,
      severity: 'high',
      severityText: 'Высокий урон',
      icon: 'fas fa-pizza-slice'
    },
    {
      id: 'energy-drinks',
      title: 'Энергетики',
      description: 'Покупка энергетиков для ночных смен',
      cost: 4000,
      severity: 'medium',
      severityText: 'Средний урон',
      icon: 'fas fa-bolt'
    }
  ])
  
  // Замена привычек
  const habitReplacements = ref([
    {
      id: 'food-replacement',
      title: 'Готовка вместо доставки',
      description: 'Готовьте простые блюда дома 4 дня в неделю',
      oldHabit: 'Заказ еды',
      newHabit: 'Готовка дома',
      oldIcon: 'fas fa-pizza-slice',
      newIcon: 'fas fa-utensils',
      monthlySavings: 8000,
      yearlySavings: 96000,
      steps: [
        'Купите мультиварку для простой готовки',
        'Составьте список из 5 простых рецептов',
        'Заказывайте еду максимум 3 раза в неделю',
        'Готовьте сразу на 2-3 дня'
      ]
    },
    {
      id: 'energy-replacement',
      title: 'Кофе вместо энергетиков',
      description: 'Замените энергетики на кофе или крепкий чай',
      oldHabit: 'Энергетики',
      newHabit: 'Кофе/чай',
      oldIcon: 'fas fa-bolt',
      newIcon: 'fas fa-coffee',
      monthlySavings: 3000,
      yearlySavings: 36000,
      steps: [
        'Купите качественный кофе в зернах',
        'Приобретите термос для рабочих смен',
        'Постепенно заменяйте энергетики на кофе',
        'Добавьте витамин B для энергии'
      ]
    }
  ])
  
  // Мотивационные этапы
  const motivationMilestones = ref([
    {
      id: 'first-debt',
      title: 'Первый долг погашен!',
      description: 'Закрыта рассрочка с самым высоким процентом',
      reward: '🎉 Празднуем! Можно заказать любимую еду',
      progress: 15,
      current: true,
      completed: false,
      icon: 'fas fa-trophy'
    },
    {
      id: 'half-way',
      title: 'Половина пути пройдена',
      description: 'Выплачено 50% от общей суммы долгов',
      reward: '🎁 Небольшой подарок себе до 5000₽',
      progress: 0,
      current: false,
      completed: false,
      icon: 'fas fa-star'
    },
    {
      id: 'freedom',
      title: 'Финансовая свобода!',
      description: 'Все долги погашены полностью',
      reward: '🏆 Крупная покупка или отпуск',
      progress: 0,
      current: false,
      completed: false,
      icon: 'fas fa-crown'
    }
  ])
  
  // ============================================
  // 🧮 ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
  // ============================================
  
  const overallProgress = computed(() => {
    const totalOriginal = 583092
    const totalCurrent = totalDebt.value
    return Math.round(((totalOriginal - totalCurrent) / totalOriginal) * 100)
  })
  
  const monthsToFreedom = computed(() => {
    return Math.ceil(totalDebt.value / availableForDebts.value)
  })
  
  const debtsProgress = computed(() => {
    return debtStrategy.value.map(debt => ({
      id: debt.id,
      name: debt.name,
      original: debt.amount,
      remaining: debt.amount * (1 - debt.progress / 100),
      paid: debt.amount * (debt.progress / 100),
      progress: debt.progress
    }))
  })
  
  // ============================================
  // 🎨 МЕТОДЫ КОМПОНЕНТА
  // ============================================
  
  /**
   * Получение стилей для анимированных частиц фона
   */
  const getParticleStyle = (index: number) => {
    const delay = Math.random() * 20
    const duration = 15 + Math.random() * 10
    const size = 2 + Math.random() * 4
    
    return {
      left: Math.random() * 100 + '%',
      animationDelay: delay + 's',
      animationDuration: duration + 's',
      width: size + 'px',
      height: size + 'px'
    }
  }
  
  /**
   * Переключение темы интерфейса
   */
  const toggleTheme = () => {
    isDark.value = !isDark.value
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }
  
  /**
   * Форматирование валютных значений
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }
  
  /**
   * Получение CSS-класса для приоритета долга
   */
  const getPriorityClass = (priority: number): string => {
    if (priority >= 50) return 'priority-critical'
    if (priority >= 25) return 'priority-high'
    if (priority >= 15) return 'priority-medium'
    return 'priority-low'
  }
  
  /**
   * Переключение элемента чек-листа
   */
  const toggleChecklistItem = (item: any) => {
    item.completed = !item.completed
  }
  
  /**
   * Применение рекомендации по экономии
   */
  const applyRecommendation = (recommendation: SavingRecommendation) => {
    console.log('Применение рекомендации:', recommendation.title)
    // Здесь можно добавить логику для применения рекомендации
  }
  
  /**
   * Отметка выполнения привычки
   */
  const markHabitCompleted = (habit: any) => {
    habit.todayCompleted = !habit.todayCompleted
    if (habit.todayCompleted) {
      habit.streak++
      habit.progress = Math.min(100, habit.progress + 5)
    }
  }
  
  /**
   * Начало работы с возможностью заработка
   */
  const startOpportunity = (opportunity: any) => {
    console.log('Начало работы с:', opportunity.title)
    // Здесь можно добавить логику для начала работы
  }
  
  /**
   * Начало замены привычки
   */
  const startReplacement = (replacement: any) => {
    console.log('Начало замены привычки:', replacement.title)
    // Здесь можно добавить логику для замены привычки
  }
  
  /**
   * Открытие быстрого добавления
   */
  const openQuickAdd = () => {
    console.log('Открытие быстрого добавления')
  }
  
  /**
   * Открытие настроек
   */
  const openSettings = () => {
    console.log('Открытие настроек')
  }
  
  // ============================================
  // 🚀 ЖИЗНЕННЫЙ ЦИКЛ КОМПОНЕНТА
  // ============================================
  
  onMounted(() => {
    // Установка темной темы по умолчанию
    document.documentElement.setAttribute('data-theme', 'dark')
    
    console.log('💰 Финансовый дашборд Fox Taffy загружен!')
  })
  </script>
  
  <style scoped>
  /* ============================================ */
  /* 🎨 ПЕРЕМЕННЫЕ И ОСНОВНЫЕ СТИЛИ */
  /* ============================================ */
  
  :root {
    /* Темная тема */
    --bg-primary: #0a0a0a;
    --bg-secondary: #1a1a1a;
    --bg-tertiary: #2a2a2a;
    --bg-glass: rgba(255, 255, 255, 0.05);
    --bg-glass-hover: rgba(255, 255, 255, 0.1);
    
    /* Текст */
    --text-primary: #ffffff;
    --text-secondary: #b0b0b0;
    --text-muted: #808080;
    
    /* Акцентные цвета */
    --accent-primary: #ff6b6b;
    --accent-secondary: #4ecdc4;
    --accent-tertiary: #45b7d1;
    --accent-success: #96ceb4;
    --accent-warning: #feca57;
    --accent-danger: #ff6b6b;
    
    /* Градиенты */
    --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    --gradient-success: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    --gradient-warning: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    --gradient-danger: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    
    /* Тени */
    --shadow-small: 0 2px 10px rgba(0, 0, 0, 0.1);
    --shadow-medium: 0 8px 30px rgba(0, 0, 0, 0.2);
    --shadow-large: 0 20px 60px rgba(0, 0, 0, 0.3);
    --shadow-glow: 0 0 20px rgba(103, 126, 234, 0.5);
    
    /* Переходы */
    --transition-fast: 0.2s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
    
    /* Размеры */
    --border-radius: 16px;
    --border-radius-small: 8px;
    --border-radius-large: 24px;
  }
  
  /* Базовые стили */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .financial-dashboard {
    min-height: 100vh;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    position: relative;
    overflow-x: hidden;
  }
  
  /* ============================================ */
  /* 🌟 АНИМИРОВАННЫЙ ФОН */
  /* ============================================ */
  
  .animated-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }
  
  .particle {
    position: absolute;
    background: var(--accent-primary);
    border-radius: 50%;
    opacity: 0.1;
    animation: float infinite linear;
  }
  
  @keyframes float {
    0% {
      transform: translateY(100vh) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 0.1;
    }
    90% {
      opacity: 0.1;
    }
    100% {
      transform: translateY(-100px) rotate(360deg);
      opacity: 0;
    }
  }
  
  /* ============================================ */
  /* 🎯 ЗАГОЛОВОК ДАШБОРДА */
  /* ============================================ */
  
  .dashboard-header {
    position: relative;
    z-index: 10;
    padding: 2rem;
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .logo-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .logo-icon {
    width: 60px;
    height: 60px;
    background: var(--gradient-primary);
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    box-shadow: var(--shadow-glow);
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .logo-text h1 {
    font-size: 2rem;
    font-weight: 700;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.25rem;
  }
  
  .logo-text p {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
  
  .theme-toggle {
    width: 50px;
    height: 50px;
    background: var(--bg-glass);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--transition-normal);
    backdrop-filter: blur(10px);
  }
  
  .theme-toggle:hover {
    background: var(--bg-glass-hover);
    transform: scale(1.1);
  }
  
  /* ============================================ */
  /* 📱 ОСНОВНОЙ КОНТЕНТ */
  /* ============================================ */
  
  .dashboard-content {
    display: flex;
    max-width: 1400px;
    margin: 0 auto;
    min-height: calc(100vh - 140px);
    position: relative;
    z-index: 5;
  }
  
  /* ============================================ */
  /* 🧭 БОКОВАЯ НАВИГАЦИЯ */
  /* ============================================ */
  
  .sidebar {
    width: 280px;
    padding: 2rem 0;
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    position: sticky;
    top: 0;
    height: calc(100vh - 140px);
    overflow-y: auto;
  }
  
  .nav-items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0 1rem;
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: transparent;
    border: none;
    border-radius: var(--border-radius);
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition-normal);
    position: relative;
    overflow: hidden;
  }
  
  .nav-item:hover {
    background: var(--bg-glass-hover);
    color: var(--text-primary);
    transform: translateX(8px);
  }
  
  .nav-item.active {
    background: var(--gradient-primary);
    color: white;
    box-shadow: var(--shadow-glow);
  }
  
  .nav-item i {
    font-size: 1.2rem;
    width: 20px;
    text-align: center;
  }
  
  .nav-item span {
    font-weight: 500;
    font-size: 0.95rem;
  }
  
  .nav-indicator {
    position: absolute;
    right: 1rem;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent-primary);
    opacity: 0;
    transition: var(--transition-normal);
  }
  
  .nav-item.active .nav-indicator {
    opacity: 1;
  }
  
  /* ============================================ */
  /* 📊 ОСНОВНАЯ ПАНЕЛЬ */
  /* ============================================ */
  
  .main-panel {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
  }
  
  .panel-content {
    animation: slideIn 0.5s ease;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .panel-header {
    margin-bottom: 2rem;
  }
  
  .panel-header h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .panel-header p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }
  
  /* ============================================ */
  /* 💳 ОБЗОРНЫЕ КАРТОЧКИ */
  /* ============================================ */
  
  .overview-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }
  
  .stat-card {
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-large);
    padding: 2rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    transition: var(--transition-normal);
    position: relative;
    overflow: hidden;
  }
  
  .stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--gradient-primary);
    opacity: 0;
    transition: var(--transition-normal);
  }
  
  .stat-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-large);
  }
  
  .stat-card:hover::before {
    opacity: 1;
  }
  
  .stat-card.debt-total::before {
    background: var(--gradient-danger);
  }
  
  .stat-card.income-total::before {
    background: var(--gradient-success);
  }
  
  .stat-card.available-funds::before {
    background: var(--gradient-warning);
  }
  
  .card-icon {
    width: 70px;
    height: 70px;
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    color: white;
    flex-shrink: 0;
  }
  
  .debt-total .card-icon {
    background: var(--gradient-danger);
  }
  
  .income-total .card-icon {
    background: var(--gradient-success);
  }
  
  .available-funds .card-icon {
    background: var(--gradient-warning);
  }
  
  .card-content {
    flex: 1;
  }
  
  .card-content h3 {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .card-content .amount {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }
  
  .trend {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    font-weight: 500;
  }
  
  .trend.positive {
    color: var(--accent-success);
  }
  
  .trend.negative {
    color: var(--accent-danger);
  }
  
  .trend.neutral {
    color: var(--text-secondary);
  }
  
  /* ============================================ */
  /* 🎯 СТРАТЕГИЯ ДОЛГОВ */
  /* ============================================ */
  
  .debt-strategy {
    margin-bottom: 3rem;
  }
  
  .debt-strategy h3 {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 2rem;
    color: var(--text-primary);
  }
  
  .strategy-timeline {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .strategy-item {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 2rem;
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-large);
    transition: var(--transition-normal);
    position: relative;
  }
  
  .strategy-item:hover {
    transform: translateX(8px);
    box-shadow: var(--shadow-medium);
  }
  
  .strategy-item.completed {
    opacity: 0.7;
    background: var(--gradient-success);
  }
  
  .strategy-number {
    width: 50px;
    height: 50px;
    background: var(--gradient-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  }
  
  .strategy-content {
    flex: 1;
  }
  
  .strategy-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .strategy-header h4 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .priority-badge {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .priority-badge.priority-critical {
    background: var(--gradient-danger);
    color: white;
  }
  
  .priority-badge.priority-high {
    background: var(--gradient-warning);
    color: white;
  }
  
  .priority-badge.priority-medium {
    background: var(--gradient-secondary);
    color: white;
  }
  
  .priority-badge.priority-low {
    background: var(--gradient-success);
    color: white;
  }
  
  .strategy-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .debt-amount,
  .monthly-payment,
  .payoff-time {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: var(--bg-secondary);
    border-radius: var(--border-radius-small);
  }
  
  .debt-amount .label,
  .monthly-payment .label,
  .payoff-time .label {
    color: var(--text-secondary);
    font-size: 0.85rem;
  }
  
  .debt-amount .value,
  .monthly-payment .value,
  .payoff-time .value {
    color: var(--text-primary);
    font-weight: 600;
  }
  
  .strategy-progress {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .progress-bar {
    flex: 1;
    height: 8px;
    background: var(--bg-secondary);
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background: var(--gradient-primary);
    transition: width 0.8s ease;
  }
  
  .progress-text {
    color: var(--text-secondary);
    font-size: 0.85rem;
    font-weight: 500;
    min-width: 80px;
    text-align: right;
  }
  
  /* ============================================ */
  /* 📅 КАЛЕНДАРЬ ВЫПЛАТ */
  /* ============================================ */
  
  .payment-calendar {
    margin-bottom: 3rem;
  }
  
  .payment-calendar h3 {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 2rem;
    color: var(--text-primary);
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
  }
  
  .month-card {
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-large);
    padding: 2rem;
    transition: var(--transition-normal);
  }
  
  .month-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-medium);
  }
  
  .month-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .month-header h4 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .month-total {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--accent-primary);
  }
  
  .month-payments {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .payment-item {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    gap: 1rem;
    align-items: center;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: var(--border-radius-small);
    transition: var(--transition-fast);
  }
  
  .payment-item:hover {
    background: var(--bg-tertiary);
  }
  
  .payment-date {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 500;
  }
  
  .payment-name {
    font-size: 0.95rem;
    color: var(--text-primary);
    font-weight: 500;
  }
  
  .payment-amount {
    font-size: 1rem;
    font-weight: 600;
    color: var(--accent-primary);
  }
  
  /* ============================================ */
  /* 💡 РЕКОМЕНДАЦИИ ПО ЭКОНОМИИ */
  /* ============================================ */
  
  .saving-recommendations {
    margin-bottom: 3rem;
  }
  
  .saving-recommendations h3 {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 2rem;
    color: var(--text-primary);
  }
  
  .recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 2rem;
  }
  
  .recommendation-card {
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-large);
    padding: 2rem;
    transition: var(--transition-normal);
    position: relative;
    overflow: hidden;
  }
  
  .recommendation-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    opacity: 0;
    transition: var(--transition-normal);
  }
  
  .recommendation-card.high-impact::before {
    background: var(--gradient-danger);
  }
  
  .recommendation-card.medium-impact::before {
    background: var(--gradient-warning);
  }
  
  .recommendation-card.easy-win::before {
    background: var(--gradient-success);
  }
  
  .recommendation-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-large);
  }
  
  .recommendation-card:hover::before {
    opacity: 1;
  }
  
  .recommendation-icon {
    width: 60px;
    height: 60px;
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    margin-bottom: 1.5rem;
  }
  
  .high-impact .recommendation-icon {
    background: var(--gradient-danger);
  }
  
  .medium-impact .recommendation-icon {
    background: var(--gradient-warning);
  }
  
  .easy-win .recommendation-icon {
    background: var(--gradient-success);
  }
  
  .recommendation-content h4 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
  }
  
  .recommendation-content p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }
  
  .recommendation-savings {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: var(--border-radius-small);
  }
  
  .savings-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
  
  .savings-amount {
    color: var(--accent-success);
    font-weight: 700;
    font-size: 1.1rem;
  }
  
  .recommendation-difficulty {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .difficulty-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
  
  .difficulty-stars {
    display: flex;
    gap: 0.25rem;
  }
  
  .difficulty-stars i {
    color: var(--bg-tertiary);
    font-size: 0.9rem;
  }
  
  .difficulty-stars i.active {
    color: var(--accent-warning);
  }
  
  .apply-btn {
    width: 100%;
    padding: 1rem;
    background: var(--gradient-primary);
    border: none;
    border-radius: var(--border-radius);
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-normal);
  }
  
  .apply-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow);
  }
  
  /* ============================================ */
  /* 📈 ТРЕКЕР ПРИВЫЧЕК */
  /* ============================================ */
  
  .habit-tracker {
    margin-bottom: 3rem;
  }
  
  .habit-tracker h3 {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 2rem;
    color: var(--text-primary);
  }
  
  .habits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }
  
  .habit-card {
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-large);
    padding: 2rem;
    text-align: center;
    transition: var(--transition-normal);
  }
  
  .habit-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-medium);
  }
  
  .habit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .habit-header h4 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .habit-streak {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--accent-warning);
    font-size: 0.9rem;
    font-weight: 600;
  }
  
  .habit-progress {
    margin-bottom: 2rem;
  }
  
  .progress-circle {
    width: 120px;
    height: 120px;
    margin: 0 auto;
    position: relative;
  }
  
  .circle-progress {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient(
      var(--accent-primary) 0deg,
      var(--accent-primary) calc(var(--progress) * 3.6deg),
      var(--bg-secondary) calc(var(--progress) * 3.6deg),
      var(--bg-secondary) 360deg
    );
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  
  .circle-progress::before {
    content: '';
    width: 80%;
    height: 80%;
    background: var(--bg-primary);
    border-radius: 50%;
    position: absolute;
  }
  
  .progress-text {
    position: relative;
    z-index: 1;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
  }
  
  .habit-complete-btn {
    width: 100%;
    padding: 1rem;
    background: var(--bg-secondary);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius);
    color: var(--text-primary);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-normal);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .habit-complete-btn:hover {
    background: var(--bg-tertiary);
  }
  
  .habit-complete-btn.completed {
    background: var(--gradient-success);
    color: white;
  }
  
  /* ============================================ */
  /* 💼 ВОЗМОЖНОСТИ ДОПОЛНИТЕЛЬНОГО ДОХОДА */
  /* ============================================ */
  
  .skills-analysis {
    margin-bottom: 3rem;
  }
  
  .skills-analysis h3 {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 2rem;
    color: var(--text-primary);
  }
  
  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }
  
  .skill-card {
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-large);
    padding: 2rem;
    transition: var(--transition-normal);
  }
  
  .skill-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-medium);
  }
  
  .skill-icon {
    width: 60px;
    height: 60px;
    background: var(--gradient-primary);
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    margin-bottom: 1.5rem;
  }
  
  .skill-content h4 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
  
  .skill-content p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }
  
  .skill-level {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .level-bar {
    flex: 1;
    height: 8px;
    background: var(--bg-secondary);
    border-radius: 4px;
    overflow: hidden;
  }
  
  .level-fill {
    height: 100%;
    background: var(--gradient-primary);
    transition: width 0.8s ease;
  }
  
  .skill-level span {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 500;
    min-width: 100px;
  }
  
  .income-opportunities {
    margin-bottom: 3rem;
  }
  
  .income-opportunities h3 {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 2rem;
    color: var(--text-primary);
  }
  
  .opportunities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
    gap: 2rem;
  }
  
  .opportunity-card {
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-large);
    padding: 2rem;
    transition: var(--transition-normal);
  }
  
  .opportunity-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-large);
  }
  
  .opportunity-header {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .opportunity-icon {
    width: 60px;
    height: 60px;
    background: var(--gradient-primary);
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    flex-shrink: 0;
  }
  
  .opportunity-title h4 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
  
  .opportunity-title p {
    color: var(--text-secondary);
    line-height: 1.6;
  }
  
  .opportunity-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .stat-item {
    text-align: center;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: var(--border-radius-small);
  }
  
  .stat-label {
    display: block;
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }
  
  .stat-value {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .opportunity-details {
    margin-bottom: 2rem;
  }
  
  .opportunity-details h5 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
  }
  
  .steps-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .steps-list li {
    padding: 0.5rem 0;
    color: var(--text-secondary);
    position: relative;
    padding-left: 1.5rem;
  }
  
  .steps-list li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: var(--accent-primary);
    font-weight: bold;
  }
  
  .opportunity-platforms {
    margin-bottom: 2rem;
  }
  
  .opportunity-platforms h5 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
  }
  
  .platforms-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .platform-tag {
    padding: 0.5rem 1rem;
    background: var(--bg-secondary);
    border-radius: 20px;
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-weight: 500;
  }
  
  .start-btn {
    width: 100%;
    padding: 1rem;
    background: var(--gradient-primary);
    border: none;
    border-radius: var(--border-radius);
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-normal);
  }
  
  .start-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow);
  }
  
  /* ============================================ */
  /* 📊 ВИЗУАЛИЗАЦИЯ ПРОГРЕССА */
  /* ============================================ */
  
  .overall-progress {
    margin-bottom: 3rem;
  }
  
  .progress-hero {
    display: flex;
    align-items: center;
    gap: 3rem;
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-large);
    padding: 3rem;
  }
  
  .progress-circle-large {
    width: 200px;
    height: 200px;
    flex-shrink: 0;
  }
  
  .circle-progress-large {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient(
      var(--accent-primary) 0deg,
      var(--accent-primary) calc(var(--progress) * 3.6deg),
      var(--bg-secondary) calc(var(--progress) * 3.6deg),
      var(--bg-secondary) 360deg
    );
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: var(--shadow-glow);
  }
  
  .circle-progress-large::before {
    content: '';
    width: 75%;
    height: 75%;
    background: var(--bg-primary);
    border-radius: 50%;
    position: absolute;
  }
  
  .progress-content {
    position: relative;
    z-index: 1;
    text-align: center;
  }
  
  .progress-percentage {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
  
  .progress-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
  }
  
  .progress-stats {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .progress-stats .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    background: var(--bg-secondary);
    border-radius: var(--border-radius);
  }
  
  .progress-stats .stat-label {
    color: var(--text-secondary);
    font-size: 1rem;
  }
  
  .progress-stats .stat-value {
    color: var(--text-primary);
    font-size: 1.3rem;
    font-weight: 600;
  }
  
  .debt-progress {
    margin-bottom: 3rem;
  }
  
  .debt-progress h3 {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 2rem;
    color: var(--text-primary);
  }
  
  .debt-progress-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
  }
  
  .debt-progress-card {
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-large);
    padding: 2rem;
    transition: var(--transition-normal);
  }
  
  .debt-progress-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-medium);
  }
  
  .debt-progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .debt-progress-header h4 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .debt-percentage {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent-primary);
  }
  
  .debt-progress-bar {
    height: 12px;
    background: var(--bg-secondary);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 1.5rem;
  }
  
  .debt-progress-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: var(--bg-secondary);
    border-radius: var(--border-radius-small);
  }
  
  .detail-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
  
  .detail-value {
    color: var(--text-primary);
    font-weight: 600;
  }
  
  /* ============================================ */
  /* 🎯 МОТИВАЦИОННЫЕ ЭТАПЫ */
  /* ============================================ */
  
  .motivation-milestones {
    margin-bottom: 3rem;
  }
  
  .motivation-milestones h3 {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 2rem;
    color: var(--text-primary);
  }
  
  .milestones-timeline {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .milestone-item {
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 2rem;
    background: var(--bg-glass);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-large);
    transition: var(--transition-normal);
    position: relative;
  }
  
  .milestone-item:hover {
    transform: translateX(8px);
    box-shadow: var(--shadow-medium);
  }
  
  .milestone-item.completed {
    background: var(--gradient-success);
    color: white;
  }
  
  .milestone-item.current {
    border-color: var(--accent-primary);
    box-shadow: 0 0 20px rgba(255, 107, 107, 0.3);
  }
  
  .milestone-icon {
    width: 70px;
    height: 70px;
    background: var(--gradient-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    color: white;
    flex-shrink: 0;
  }

  </style>