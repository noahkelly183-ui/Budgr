export const DEMO_YEAR = 2026

export const DEMO_SALARY = {
  gross: 85000,
  taxRate: 28,
  deductions: 220,
  extraIncome: 0,
}

export const DEMO_FIXED_COSTS = [
  { id: 'demo-fc-1', name: 'Rent', amount: 1850, category: 'Rent / Mortgage', frequency: 'monthly', isSavings: false, year: DEMO_YEAR, start_month: null },
  { id: 'demo-fc-2', name: 'Internet', amount: 80, category: 'Phone & Internet', frequency: 'monthly', isSavings: false, year: DEMO_YEAR, start_month: null },
  { id: 'demo-fc-3', name: 'Car Insurance', amount: 145, category: 'Car Payment / Insurance', frequency: 'monthly', isSavings: false, year: DEMO_YEAR, start_month: null },
  { id: 'demo-fc-4', name: 'Gym', amount: 55, category: 'Fitness & Gym', frequency: 'monthly', isSavings: false, year: DEMO_YEAR, start_month: null },
  { id: 'demo-fc-5', name: 'Netflix + Spotify', amount: 28, category: 'Subscriptions', frequency: 'monthly', isSavings: false, year: DEMO_YEAR, start_month: null },
]

export const DEMO_SAVINGS_ENTRIES = [
  { id: 'demo-sv-1', name: 'RRSP Contribution', amount: 500, category: 'RRSP', frequency: 'monthly', isSavings: true, year: DEMO_YEAR, start_month: null },
  { id: 'demo-sv-2', name: 'Emergency Fund', amount: 250, category: 'Savings', frequency: 'monthly', isSavings: true, year: DEMO_YEAR, start_month: null },
  { id: 'demo-sv-3', name: 'TFSA Index Fund', amount: 300, category: 'TFSA', frequency: 'monthly', isSavings: true, year: DEMO_YEAR, start_month: null },
]

function tx(id, date, description, amount, type, category) {
  return { id, date, description, amount, type, category, fromMemory: false }
}

export const DEMO_TRANSACTIONS = [
  // May 2026
  tx('demo-t-01', '2026-05-01', 'PAYROLL DEPOSIT', 4720.83, 'credit', 'Transfer / Payment'),
  tx('demo-t-02', '2026-05-02', 'FRESHCO GROCERY', 127.45, 'debit', 'Groceries'),
  tx('demo-t-03', '2026-05-03', 'TIM HORTONS', 6.75, 'debit', 'Coffee & Drinks'),
  tx('demo-t-04', '2026-05-05', 'NETFLIX.COM', 17.99, 'debit', 'Subscriptions'),
  tx('demo-t-05', '2026-05-07', 'UBER EATS', 38.40, 'debit', 'Dining Out'),
  tx('demo-t-06', '2026-05-08', 'SHELL GAS STATION', 72.10, 'debit', 'Fuel'),
  tx('demo-t-07', '2026-05-10', 'CINEPLEX MOVIES', 28.50, 'debit', 'Entertainment'),
  tx('demo-t-08', '2026-05-12', 'METRO GROCERY', 89.20, 'debit', 'Groceries'),
  tx('demo-t-09', '2026-05-14', 'STARBUCKS', 9.25, 'debit', 'Coffee & Drinks'),
  tx('demo-t-10', '2026-05-15', 'AMAZON.CA', 54.99, 'debit', 'Shopping'),
  tx('demo-t-11', '2026-05-18', 'CHIPOTLE', 19.80, 'debit', 'Dining Out'),
  tx('demo-t-12', '2026-05-20', 'GOODLIFE FITNESS', 55.00, 'debit', 'Fitness & Gym'),
  tx('demo-t-13', '2026-05-22', 'LCBO', 42.30, 'debit', 'Bars & Nightlife'),
  tx('demo-t-14', '2026-05-24', 'UBER', 18.50, 'debit', 'Transit / Rideshare'),
  tx('demo-t-15', '2026-05-26', 'SHOPPERS DRUG MART', 31.20, 'debit', 'Health & Medical'),
  tx('demo-t-16', '2026-05-28', 'IKEA CANADA', 149.99, 'debit', 'Home & Garden'),
  tx('demo-t-17', '2026-05-30', 'VISA PAYMENT', 1200.00, 'debit', 'Credit Card Payment'),

  // April 2026
  tx('demo-t-18', '2026-04-01', 'PAYROLL DEPOSIT', 4720.83, 'credit', 'Transfer / Payment'),
  tx('demo-t-19', '2026-04-02', 'FRESHCO GROCERY', 143.60, 'debit', 'Groceries'),
  tx('demo-t-20', '2026-04-04', 'SPOTIFY', 11.99, 'debit', 'Subscriptions'),
  tx('demo-t-21', '2026-04-06', 'THE KEG STEAKHOUSE', 87.40, 'debit', 'Dining Out'),
  tx('demo-t-22', '2026-04-08', 'PETRO CANADA', 68.25, 'debit', 'Fuel'),
  tx('demo-t-23', '2026-04-10', 'TIM HORTONS', 5.50, 'debit', 'Coffee & Drinks'),
  tx('demo-t-24', '2026-04-14', 'APPLE.COM/BILL', 14.99, 'debit', 'Subscriptions'),
  tx('demo-t-25', '2026-04-16', 'H&M CLOTHING', 76.40, 'debit', 'Clothing'),
  tx('demo-t-26', '2026-04-18', 'METRO GROCERY', 101.85, 'debit', 'Groceries'),
  tx('demo-t-27', '2026-04-22', 'TORONTO TRANSIT', 3.35, 'debit', 'Transit / Rideshare'),
  tx('demo-t-28', '2026-04-24', 'AMAZON.CA', 38.49, 'debit', 'Shopping'),
  tx('demo-t-29', '2026-04-26', 'SKIP THE DISHES', 44.20, 'debit', 'Dining Out'),
  tx('demo-t-30', '2026-04-28', 'FREELANCE PAYMENT', 600.00, 'credit', 'Transfer / Payment'),
  tx('demo-t-31', '2026-04-30', 'VISA PAYMENT', 1100.00, 'debit', 'Credit Card Payment'),

  // March 2026
  tx('demo-t-32', '2026-03-01', 'PAYROLL DEPOSIT', 4720.83, 'credit', 'Transfer / Payment'),
  tx('demo-t-33', '2026-03-03', 'COSTCO WHOLESALE', 218.75, 'debit', 'Groceries'),
  tx('demo-t-34', '2026-03-06', 'NETFLIX.COM', 17.99, 'debit', 'Subscriptions'),
  tx('demo-t-35', '2026-03-08', 'CANUCKS TICKETS', 145.00, 'debit', 'Entertainment'),
  tx('demo-t-36', '2026-03-10', 'STARBUCKS', 12.40, 'debit', 'Coffee & Drinks'),
  tx('demo-t-37', '2026-03-12', 'SHELL GAS STATION', 65.80, 'debit', 'Fuel'),
  tx('demo-t-38', '2026-03-15', 'LOBLAWS GROCERY', 97.30, 'debit', 'Groceries'),
  tx('demo-t-39', '2026-03-19', 'SPORT CHEK', 89.99, 'debit', 'Hobbies & Sports'),
  tx('demo-t-40', '2026-03-22', 'UBER EATS', 29.60, 'debit', 'Dining Out'),
  tx('demo-t-41', '2026-03-25', 'REXALL PHARMACY', 28.15, 'debit', 'Health & Medical'),
  tx('demo-t-42', '2026-03-28', 'VISA PAYMENT', 950.00, 'debit', 'Credit Card Payment'),

  // February 2026
  tx('demo-t-43', '2026-02-01', 'PAYROLL DEPOSIT', 4720.83, 'credit', 'Transfer / Payment'),
  tx('demo-t-44', '2026-02-03', 'FRESHCO GROCERY', 119.50, 'debit', 'Groceries'),
  tx('demo-t-45', '2026-02-07', 'VALENTINES DINNER', 112.30, 'debit', 'Dining Out'),
  tx('demo-t-46', '2026-02-10', 'AMAZON.CA', 67.99, 'debit', 'Shopping'),
  tx('demo-t-47', '2026-02-12', 'TIM HORTONS', 7.20, 'debit', 'Coffee & Drinks'),
  tx('demo-t-48', '2026-02-14', 'ROOTS CANADA', 124.00, 'debit', 'Clothing'),
  tx('demo-t-49', '2026-02-18', 'CINEPLEX MOVIES', 24.00, 'debit', 'Entertainment'),
  tx('demo-t-50', '2026-02-22', 'PETRO CANADA', 71.40, 'debit', 'Fuel'),
  tx('demo-t-51', '2026-02-26', 'VISA PAYMENT', 880.00, 'debit', 'Credit Card Payment'),

  // January 2026
  tx('demo-t-52', '2026-01-01', 'PAYROLL DEPOSIT', 4720.83, 'credit', 'Transfer / Payment'),
  tx('demo-t-53', '2026-01-04', 'COSTCO WHOLESALE', 198.40, 'debit', 'Groceries'),
  tx('demo-t-54', '2026-01-07', 'NETFLIX.COM', 17.99, 'debit', 'Subscriptions'),
  tx('demo-t-55', '2026-01-09', 'SPORT CHEK', 159.99, 'debit', 'Hobbies & Sports'),
  tx('demo-t-56', '2026-01-12', 'STARBUCKS', 8.75, 'debit', 'Coffee & Drinks'),
  tx('demo-t-57', '2026-01-15', 'THE KEG STEAKHOUSE', 74.20, 'debit', 'Dining Out'),
  tx('demo-t-58', '2026-01-18', 'SHELL GAS STATION', 60.50, 'debit', 'Fuel'),
  tx('demo-t-59', '2026-01-22', 'LOBLAWS GROCERY', 88.60, 'debit', 'Groceries'),
  tx('demo-t-60', '2026-01-26', 'AMAZON.CA', 44.99, 'debit', 'Shopping'),
  tx('demo-t-61', '2026-01-29', 'VISA PAYMENT', 820.00, 'debit', 'Credit Card Payment'),
]
