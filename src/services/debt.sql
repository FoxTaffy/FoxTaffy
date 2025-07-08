-- ============================================
-- 💰 МИНИМАЛЬНАЯ НАСТРОЙКА БД FOX TAFFY (БЕЗ ОШИБОК)
-- ============================================
-- Скопируйте ВЕСЬ код и выполните ОДНИМ запросом в SQL Editor

-- 1. Создание основных таблиц
CREATE TABLE IF NOT EXISTS debts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  current_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  original_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  interest_rate DECIMAL(5,2) DEFAULT 0,
  payment_date INTEGER NOT NULL DEFAULT 1,
  minimum_payment DECIMAL(12,2) NOT NULL DEFAULT 0,
  priority INTEGER NOT NULL DEFAULT 1,
  type TEXT NOT NULL DEFAULT 'credit',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'income',
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  category TEXT,
  debt_id INTEGER REFERENCES debts(id),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Настройка Row Level Security (упрощенно)
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Политики для полного доступа (для личного использования)
CREATE POLICY "Allow all" ON debts FOR ALL USING (true);
CREATE POLICY "Allow all" ON transactions FOR ALL USING (true);

-- 3. Вставка ваших долгов
INSERT INTO debts (name, current_balance, original_amount, interest_rate, payment_date, minimum_payment, priority, type) VALUES
  ('Спермбанк', 270700.00, 270700.00, 25.4, 1, 10000.00, 2, 'credit'),
  ('Рассрочка', 126392.10, 126392.10, 60.0, 26, 8000.00, 1, 'installment'),
  ('Т Банк', 75000.00, 75000.00, 23.0, 9, 5000.00, 3, 'credit'),
  ('Сплит', 111000.00, 111000.00, 0.0, 15, 18000.00, 4, 'split')
ON CONFLICT DO NOTHING;

-- 4. Проверочный запрос
SELECT 
  'База данных создана!' as status,
  COUNT(*) as debts_count,
  SUM(current_balance) as total_debt
FROM debts;