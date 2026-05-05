export const CATEGORIES = [
  'Bars & Nightlife', 'Car Payment / Insurance', 'Clothing', 'Coffee & Drinks',
  'Credit Card Payment', 'Dining Out', 'Education', 'Emergency Fund', 'Entertainment',
  'Fees & Charges', 'Fitness & Gym', 'Fuel',
  'Gifts & Donations', 'Groceries', 'Health & Medical',
  'Hobbies & Sports', 'Home & Garden', 'Insurance',
  'Investments', 'Loan Repayments', 'Personal Care',
  'Phone & Internet', 'Refund / Return', 'Rent / Mortgage', 'RRSP', 'Savings', 'Savings Transfer',
  'Shopping', 'Subscriptions', 'TFSA', 'Transfer / Payment', 'Transit / Rideshare',
  'Travel', 'Utilities',
]

export const EXCLUDE_FROM_TOTALS = new Set(['Transfer / Payment', 'Credit Card Payment'])

// Saving categories — lowercase for case-insensitive matching via isSaving()
export const SAVING_CATEGORIES = ['investments', 'savings', 'savings transfer', 'rrsp', 'tfsa', 'emergency fund']
export const isSaving = cat => !!cat && SAVING_CATEGORIES.includes(cat.toLowerCase())
export const savingCatLabel = cat => {
  const upper = cat.toUpperCase()
  if (upper === 'RRSP' || upper === 'TFSA') return upper
  return cat.replace(/\b\w/g, c => c.toUpperCase())
}

export const CC_PAYMENT_KEYWORDS = ['PAYMENT - THANK YOU', 'PAI EMENT', 'PAYMENT RECEIVED', 'AUTOPAY']

export const RULES = [
  { keywords: ['UBER', 'LYFT'],                                                           category: 'Transit / Rideshare' },
  { keywords: ['PETRO', 'ESSO', 'SHELL', 'CHEVRON', 'HUSKY', 'PIONEER', 'GAS BAR'],      category: 'Fuel' },
  { keywords: ['STARBUCKS', 'TIM HORTON', 'SECOND CUP', 'BLENZ', 'COFFEE'],              category: 'Coffee & Drinks' },
  { keywords: ['MCDONALD', 'WENDY', 'BURGER KING', 'SUBWAY', 'A&W', 'PIZZA', 'DOMINO',
               'KFC', 'TACO BELL', 'EARLS', 'BOSTON PIZZA', 'RESTAURANT', 'SUSHI',
               'POKE', 'TST-', 'SQ *'],                                                   category: 'Dining Out' },
  { keywords: ['WAL-MART', 'WALMART', 'COSTCO', 'SUPERSTORE', 'SAFEWAY', 'THRIFTY',
               'FAIRWAY', 'SAVE-ON', 'SAVE ON', 'LOBLAWS', 'SOBEYS', 'BULK BARN',
               'WHOLE FOODS', 'MARKET'],                                                   category: 'Groceries' },
  { keywords: ['FITNESS', 'GYM', 'YMCA', 'GOODLIFE', 'ANYTIME FITNESS', 'CROSSFIT'],     category: 'Fitness & Gym' },
  { keywords: ['MICROSOFT', 'NETFLIX', 'SPOTIFY', 'APPLE.COM', 'GOOGLE', 'AMAZON PRIME',
               'DISNEY', 'XBOX', 'PLAYSTATION', 'GAME PASS', 'ADOBE', 'DROPBOX'],        category: 'Subscriptions' },
  { keywords: ['ROGERS', 'TELUS', 'BELL', 'FIDO', 'KOODO', 'VIRGIN MOBILE', 'SHAW',
               'VIDEOTRON', 'FREEDOM MOBILE'],                                             category: 'Phone & Internet' },
  { keywords: ['SHOPPERS', 'REXALL', 'LONDON DRUGS', 'PHARMACY', 'MEDICAL', 'CLINIC',
               'DENTAL', 'OPTOM'],                                                         category: 'Health & Medical' },
  { keywords: ['LIQUOR', 'BREWERY', 'BREWING', 'DISTILLERY', 'WINERY', 'WINE', 'BEER',
               'PUB', 'BAR', 'NIGHTCLUB', 'LOUNGE', 'TAVERN', 'CASCADE', 'BRASSERIE'],   category: 'Bars & Nightlife' },
  { keywords: ['APPLE STORE', 'STAPLES'],                                                  category: 'Home & Garden' },
  { keywords: ['AMAZON', 'EBAY', 'ETSY', 'BEST BUY', 'BESTBUY', 'IKEA', 'TARGET',
               'HOMESENSE', 'WINNERS', 'MARSHALLS', 'HOME DEPOT', 'CANADIAN TIRE'],       category: 'Shopping' },
]

export const CATEGORY_GROUPS = [
  { name: 'Housing',         hex: '#0D7377', cats: ['Rent / Mortgage', 'Utilities', 'Home & Garden'] },
  { name: 'Transport',       hex: '#F59E0B', cats: ['Car Payment / Insurance', 'Fuel', 'Transit / Rideshare', 'Travel'] },
  { name: 'Food & Drink',    hex: '#22C55E', cats: ['Groceries', 'Dining Out', 'Coffee & Drinks', 'Bars & Nightlife'] },
  { name: 'Lifestyle',       hex: '#A855F7', cats: ['Clothing', 'Entertainment', 'Hobbies & Sports', 'Shopping', 'Personal Care', 'Gifts & Donations'] },
  { name: 'Bills & Finance', hex: '#3B82F6', cats: ['Phone & Internet', 'Subscriptions', 'Insurance', 'Loan Repayments', 'Fees & Charges'] },
  { name: 'Health & Growth', hex: '#EC4899', cats: ['Health & Medical', 'Fitness & Gym', 'Education'] },
  { name: 'Savings',         hex: '#14A085', cats: ['Investments', 'Savings', 'Savings Transfer', 'RRSP', 'TFSA', 'Emergency Fund'] },
]

export const CATEGORY_COLOR = Object.fromEntries(
  CATEGORY_GROUPS.flatMap(g => g.cats.map(c => [c, g.hex]))
)

export const SAVINGS_CATS = ['Investments', 'RRSP', 'Savings', 'Savings Transfer', 'TFSA']

export const FIXED_CATS = new Set([
  'Rent / Mortgage', 'Utilities', 'Car Payment / Insurance',
  'Phone & Internet', 'Subscriptions', 'Insurance',
  'Loan Repayments',
])

export const MONTHS = [
  { id: '01', label: 'January' },
  { id: '02', label: 'February' },
  { id: '03', label: 'March' },
  { id: '04', label: 'April' },
  { id: '05', label: 'May' },
  { id: '06', label: 'June' },
  { id: '07', label: 'July' },
  { id: '08', label: 'August' },
  { id: '09', label: 'September' },
  { id: '10', label: 'October' },
  { id: '11', label: 'November' },
  { id: '12', label: 'December' },
]

export const NAV_SECTIONS = [
  {
    heading: 'OVERVIEW',
    items: [
      { id: 'dashboard',    label: 'Dashboard' },
      { id: 'transactions', label: 'Transactions' },
      { id: 'salary',       label: 'Salary' },
    ],
  },
  {
    heading: 'SPENDING',
    items: [
      { id: 'fixed',      label: 'Fixed Costs' },
      { id: 'savings',    label: 'Savings' },
      { id: 'categories', label: 'Categories' },
      { id: 'annual',     label: 'Annual Summary' },
    ],
  },
  {
    heading: 'ACCOUNT',
    items: [
      { id: 'settings', label: 'Settings' },
    ],
  },
]

export const APP_YEAR = '2026'
