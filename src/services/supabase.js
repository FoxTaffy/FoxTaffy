/**
 * 🦊 FOX TAFFY - ЧИСТЫЙ API БЕЗ ДУБЛИРОВАНИЙ
 * 
 * Финальная версия API для управления долгами с полным устранением
 * всех конфликтов экспортов и обеспечением стабильной работы
 * 
 * @version 1.0.0
 * @author Fox Taffy
 */

import { createClient } from '@supabase/supabase-js'

// ============================================
// 🔧 БАЗОВАЯ КОНФИГУРАЦИЯ SUPABASE
// ============================================

const supabaseUrl = 'https://zrhdxmrouqcdnhbbrjcj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyaGR4bXJvdXFjZG5oYmJyamNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2Mzg2NDAsImV4cCI6MjA2NzIxNDY0MH0.LeiMfJToPntdPytjXykS-XCPsLVDXUWSpy5Ny1fC5nw'

export const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================
// 🔐 СИСТЕМА АУТЕНТИФИКАЦИИ
// ============================================

/**
 * API для управления аутентификацией в приватном режиме
 * Обеспечивает безопасный доступ к функциям управления долгами
 */
const authenticationAPI = {
  /**
   * Проверка пароля и создание сессии
   * @param {string} password Введенный пользователем пароль
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async login(password) {
    const CORRECT_PASSWORD = '2020'
    
    if (password === CORRECT_PASSWORD) {
      // Создаем защищенную сессию на 24 часа
      localStorage.setItem('foxtaffy_debt_auth', 'authenticated')
      localStorage.setItem('foxtaffy_debt_auth_timestamp', Date.now().toString())
      
      console.log('✅ Успешная аутентификация')
      return { success: true }
    }
    
    console.log('❌ Неверный пароль')
    return { success: false, error: 'Неверный пароль' }
  },
  
  /**
   * Завершение сессии и очистка данных
   */
  async logout() {
    localStorage.removeItem('foxtaffy_debt_auth')
    localStorage.removeItem('foxtaffy_debt_auth_timestamp')
    console.log('🚪 Сессия завершена')
  },
  
  /**
   * Проверка валидности текущей сессии
   * @returns {Promise<boolean>}
   */
  async isAuthenticated() {
    const authStatus = localStorage.getItem('foxtaffy_debt_auth')
    const authTimestamp = localStorage.getItem('foxtaffy_debt_auth_timestamp')
    
    if (!authStatus || !authTimestamp) {
      return false
    }
    
    // Проверяем, не истекла ли сессия (24 часа = 86400000 мс)
    const sessionAge = Date.now() - parseInt(authTimestamp)
    const SESSION_DURATION = 24 * 60 * 60 * 1000
    
    if (sessionAge > SESSION_DURATION) {
      await this.logout()
      return false
    }
    
    return true
  }
}

// ============================================
// 💰 СИСТЕМА УПРАВЛЕНИЯ ДОЛГАМИ
// ============================================

/**
 * Комплексный API для управления финансовыми обязательствами
 * Включает полный функционал CRUD операций, аналитики и прогнозирования
 */
const debtManagementAPI = {
  
  // ================= ИНИЦИАЛИЗАЦИЯ И ПРОВЕРКИ =================
  
  /**
   * Инициализация системы управления долгами
   * Проверяет наличие необходимых таблиц в базе данных
   * @returns {Promise<boolean>}
   */
  async initializeSystem() {
    try {
      console.log('🔄 Инициализация системы управления долгами...')
      
      // Проверяем доступность основной таблицы долгов
      const { data, error } = await supabase
        .from('debts')
        .select('id')
        .limit(1)
      
      if (error) {
        if (error.code === '42P01') {
          console.error('❌ Таблицы базы данных не созданы!')
          console.log('📋 Выполните SQL-скрипт для создания таблиц')
          return false
        }
        throw error
      }
      
      console.log('✅ Система управления долгами готова к работе')
      return true
      
    } catch (error) {
      console.error('❌ Критическая ошибка инициализации:', error)
      return false
    }
  },
  
  // ================= ОПЕРАЦИИ С ДОЛГАМИ =================
  
  /**
   * Получение списка всех активных долгов
   * Возвращает долги, отсортированные по приоритету
   * @returns {Promise<Array>}
   */
  async getAllDebts() {
    try {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true })
      
      if (error) throw error
      
      // Преобразуем строковые значения в числовые для математических операций
      const processedDebts = data.map(debt => ({
        ...debt,
        current_balance: parseFloat(debt.current_balance || 0),
        original_amount: parseFloat(debt.original_amount || 0),
        interest_rate: parseFloat(debt.interest_rate || 0),
        minimum_payment: parseFloat(debt.minimum_payment || 0)
      }))
      
      console.log(`📊 Загружено ${processedDebts.length} активных долгов`)
      return processedDebts
      
    } catch (error) {
      console.error('❌ Ошибка получения долгов:', error)
      return []
    }
  },
  
  /**
   * Обновление баланса долга после платежа
   * @param {number} debtId Идентификатор долга
   * @param {number} paymentAmount Сумма платежа
   */
  async updateDebtBalance(debtId, paymentAmount) {
    try {
      // Получаем текущие данные долга
      const { data: currentDebt, error: fetchError } = await supabase
        .from('debts')
        .select('current_balance, name')
        .eq('id', debtId)
        .single()
      
      if (fetchError) throw fetchError
      
      const oldBalance = parseFloat(currentDebt.current_balance)
      const newBalance = Math.max(0, oldBalance - paymentAmount)
      
      // Обновляем баланс в базе данных
      const { error: updateError } = await supabase
        .from('debts')
        .update({ 
          current_balance: newBalance,
          updated_at: new Date().toISOString(),
          // Деактивируем долг если он полностью погашен
          is_active: newBalance > 0
        })
        .eq('id', debtId)
      
      if (updateError) throw updateError
      
      console.log(`💰 Долг "${currentDebt.name}": ${oldBalance}₽ → ${newBalance}₽`)
      
      if (newBalance === 0) {
        console.log(`🎉 Долг "${currentDebt.name}" полностью погашен!`)
      }
      
    } catch (error) {
      console.error('❌ Ошибка обновления баланса долга:', error)
      throw error
    }
  },
  
  // ================= ОПЕРАЦИИ С ТРАНЗАКЦИЯМИ =================
  
  /**
   * Получение истории всех транзакций
   * @param {string|null} startDate Начальная дата фильтрации (YYYY-MM-DD)
   * @param {string|null} endDate Конечная дата фильтрации (YYYY-MM-DD)
   * @returns {Promise<Array>}
   */
  async getTransactionHistory(startDate = null, endDate = null) {
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          debt:debts(name, type)
        `)
        .order('transaction_date', { ascending: false })
      
      // Применяем фильтры по датам если указаны
      if (startDate) query = query.gte('transaction_date', startDate)
      if (endDate) query = query.lte('transaction_date', endDate)
      
      const { data, error } = await query
      if (error) throw error
      
      const processedTransactions = data.map(transaction => ({
        ...transaction,
        amount: parseFloat(transaction.amount || 0)
      }))
      
      console.log(`📈 Загружено ${processedTransactions.length} транзакций`)
      return processedTransactions
      
    } catch (error) {
      console.error('❌ Ошибка получения транзакций:', error)
      return []
    }
  },
  
  /**
   * Добавление нового дохода (донаты, подарки и т.д.)
   * @param {number} amount Сумма дохода
   * @param {string} description Описание источника дохода
   * @param {string} category Категория дохода
   * @returns {Promise<Object>}
   */
  async addIncome(amount, description, category = 'donation') {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          type: 'income',
          amount: parseFloat(amount),
          description: description || 'Поступление средств',
          category: category,
          transaction_date: new Date().toISOString().split('T')[0]
        }])
        .select()
      
      if (error) throw error
      
      console.log(`💚 Добавлен доход: ${amount}₽ (${description})`)
      return data[0]
      
    } catch (error) {
      console.error('❌ Ошибка добавления дохода:', error)
      throw error
    }
  },
  
  /**
   * Проведение платежа по долгу
   * @param {number} debtId Идентификатор долга
   * @param {number} amount Сумма платежа
   * @param {string} description Описание платежа
   * @returns {Promise<Object>}
   */
  async processPayment(debtId, amount, description = '') {
    try {
      // Сначала добавляем запись о транзакции
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          type: 'payment',
          amount: parseFloat(amount),
          description: description || 'Платеж по долгу',
          debt_id: debtId,
          transaction_date: new Date().toISOString().split('T')[0]
        }])
        .select()
      
      if (error) throw error
      
      // Затем обновляем баланс долга
      await this.updateDebtBalance(debtId, parseFloat(amount))
      
      console.log(`💸 Проведен платеж: ${amount}₽`)
      return data[0]
      
    } catch (error) {
      console.error('❌ Ошибка проведения платежа:', error)
      throw error
    }
  },
  
  // ================= АНАЛИТИКА И ПРОГНОЗИРОВАНИЕ =================
  
  /**
   * Комплексная аналитика финансового состояния
   * @returns {Promise<Object>}
   */
  async getFinancialAnalytics() {
    try {
      console.log('📊 Расчет финансовой аналитики...')
      
      const [debts, transactions] = await Promise.all([
        this.getAllDebts(),
        this.getTransactionHistory()
      ])
      
      // Базовые метрики
      const totalDebt = debts.reduce((sum, debt) => sum + debt.current_balance, 0)
      const totalOriginalDebt = debts.reduce((sum, debt) => sum + debt.original_amount, 0)
      const totalPaid = totalOriginalDebt - totalDebt
      
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const totalPayments = transactions
        .filter(t => t.type === 'payment')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const minimumMonthlyPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0)
      
      // Расчет доступных средств для погашения долгов
      const MONTHLY_SALARY = 100000
      const ESTIMATED_LIVING_EXPENSES = 50000
      const availableForDebt = MONTHLY_SALARY - ESTIMATED_LIVING_EXPENSES
      
      // Генерация стратегии погашения
      const paymentStrategy = this.calculateOptimalStrategy(debts, availableForDebt)
      
      // Расчет средней процентной ставки
      const averageInterestRate = debts.length > 0 
        ? debts.reduce((sum, debt) => sum + debt.interest_rate, 0) / debts.length 
        : 0
      
      const analytics = {
        // Основные показатели
        totalDebt,
        totalOriginalDebt,
        totalPaid,
        totalIncome,
        totalPayments,
        
        // Планирование
        minimumMonthlyPayment,
        availableForDebt,
        averageInterestRate,
        
        // Стратегия и прогнозы
        paymentStrategy,
        debtsByPriority: debts.sort((a, b) => b.interest_rate - a.interest_rate),
        
        // Дополнительные метрики
        debtPayoffProgress: totalOriginalDebt > 0 ? (totalPaid / totalOriginalDebt) * 100 : 0,
        monthlyInterestCost: this.calculateMonthlyInterestCost(debts)
      }
      
      console.log('✅ Аналитика рассчитана')
      return analytics
      
    } catch (error) {
      console.error('❌ Ошибка расчета аналитики:', error)
      return null
    }
  },
  
  /**
   * Расчет оптимальной стратегии погашения долгов
   * Использует метод "лавины долгов" (приоритет высоким процентам)
   * @param {Array} debts Массив долгов
   * @param {number} availableAmount Доступная сумма для погашения
   * @returns {Array}
   */
  calculateOptimalStrategy(debts, availableAmount) {
    // Сортируем долги по убыванию процентной ставки
    const sortedDebts = [...debts].sort((a, b) => b.interest_rate - a.interest_rate)
    
    let remainingBudget = availableAmount
    const strategy = []
    
    for (const debt of sortedDebts) {
      if (remainingBudget <= 0) break
      
      const minimumRequired = debt.minimum_payment
      const maxPossible = Math.min(remainingBudget, debt.current_balance)
      const recommendedPayment = Math.max(minimumRequired, maxPossible)
      
      // Расчет времени погашения
      const monthsToPayoff = this.estimatePayoffTime(
        debt.current_balance, 
        recommendedPayment, 
        debt.interest_rate
      )
      
      strategy.push({
        debtId: debt.id,
        debtName: debt.name,
        currentBalance: debt.current_balance,
        interestRate: debt.interest_rate,
        minimumPayment: debt.minimum_payment,
        recommendedPayment,
        monthsToPayoff,
        priority: debt.priority,
        potentialSavings: this.calculateInterestSavings(debt, recommendedPayment)
      })
      
      remainingBudget -= recommendedPayment
    }
    
    return strategy
  },
  
  /**
   * Оценка времени погашения долга
   * @param {number} balance Текущий баланс
   * @param {number} monthlyPayment Ежемесячный платеж
   * @param {number} annualInterestRate Годовая процентная ставка
   * @returns {number}
   */
  estimatePayoffTime(balance, monthlyPayment, annualInterestRate) {
    if (annualInterestRate === 0) {
      return Math.ceil(balance / monthlyPayment)
    }
    
    const monthlyRate = annualInterestRate / 100 / 12
    
    // Проверяем, достаточен ли платеж для покрытия процентов
    if (monthlyPayment <= balance * monthlyRate) {
      return 999 // Бесконечность (платеж недостаточен)
    }
    
    return Math.ceil(
      Math.log(1 + (balance * monthlyRate) / monthlyPayment) / 
      Math.log(1 + monthlyRate)
    )
  },
  
  /**
   * Расчет экономии на процентах при увеличенных платежах
   * @param {Object} debt Объект долга
   * @param {number} increasedPayment Увеличенный платеж
   * @returns {number}
   */
  calculateInterestSavings(debt, increasedPayment) {
    const timeWithMinimum = this.estimatePayoffTime(
      debt.current_balance, 
      debt.minimum_payment, 
      debt.interest_rate
    )
    
    const timeWithIncreased = this.estimatePayoffTime(
      debt.current_balance, 
      increasedPayment, 
      debt.interest_rate
    )
    
    if (timeWithMinimum === 999 || timeWithIncreased === 999) {
      return 0
    }
    
    const totalWithMinimum = debt.minimum_payment * timeWithMinimum
    const totalWithIncreased = increasedPayment * timeWithIncreased
    
    return Math.max(0, totalWithMinimum - totalWithIncreased - debt.current_balance)
  },
  
  /**
   * Расчет ежемесячных процентных расходов
   * @param {Array} debts Массив долгов
   * @returns {number}
   */
  calculateMonthlyInterestCost(debts) {
    return debts.reduce((total, debt) => {
      const monthlyRate = debt.interest_rate / 100 / 12
      return total + (debt.current_balance * monthlyRate)
    }, 0)
  },
  
  /**
   * Получение статистики за определенный месяц
   * @param {number} year Год
   * @param {number} month Месяц (1-12)
   * @returns {Promise<Object>}
   */
  async getMonthlyStatistics(year, month) {
    try {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`
      
      const transactions = await this.getTransactionHistory(startDate, endDate)
      
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const payments = transactions
        .filter(t => t.type === 'payment')
        .reduce((sum, t) => sum + t.amount, 0)
      
      return {
        month,
        year,
        income,
        payments,
        netFlow: income - payments,
        transactionCount: transactions.length
      }
      
    } catch (error) {
      console.error('❌ Ошибка получения месячной статистики:', error)
      return {
        month,
        year,
        income: 0,
        payments: 0,
        netFlow: 0,
        transactionCount: 0
      }
    }
  }
}

// ============================================
// 🎨 ЗАГЛУШКИ ДЛЯ СОВМЕСТИМОСТИ С ГАЛЕРЕЕЙ
// ============================================

/**
 * Упрощенные заглушки для совместимости с существующим кодом галереи
 * Позволяют избежать ошибок при загрузке компонентов галереи
 */
const galleryCompatibilityAPI = {
  async loadAllData() {
    return {
      arts: [],
      artists: [],
      tags: [],
      characters: [],
      stats: { arts: 0, artists: 0, tags: 0, characters: 0 }
    }
  },
  
  async getFurryArts() { return [] },
  async getFurryArtists() { return [] },
  async getFurryTags() { return [] },
  async getSpecies() { return [] }
}

// ============================================
// 📤 ФИНАЛЬНЫЕ ЭКСПОРТЫ (БЕЗ ДУБЛИРОВАНИЙ!)
// ============================================

// Основные API-интерфейсы
export const authApi = authenticationAPI
export const debtApi = debtManagementAPI

// Алиасы для совместимости (ТОЛЬКО ОДИН ЭКСПОРТ!)
export const api = galleryCompatibilityAPI

// Единственный экспорт для совместимости с галереей
export { galleryCompatibilityAPI as furryApi }

// Дефолтный экспорт для универсального использования
export default {
  supabase,
  authApi: authenticationAPI,
  debtApi: debtManagementAPI,
  furryApi: galleryCompatibilityAPI
}

// ============================================
// ✅ ЛОГО УСПЕШНОЙ ЗАГРУЗКИ
// ============================================

console.log(`
🦊 ===================================
   FOX TAFFY DEBT MANAGER API
   ✅ Загружен без ошибок!
===================================

📋 Доступные модули:
├── 🔐 authApi - Аутентификация
├── 💰 debtApi - Управление долгами  
├── 🎨 furryApi - Совместимость
└── 🗄️ supabase - База данных

🚫 Дублирования экспортов устранены
✨ Система готова к работе!
`)