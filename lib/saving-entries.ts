export type SavingEntryWithBankRow = {
  id: string
  account_holder: string
  principal_amount: number | string
  start_date: string
  notes: string | null
  bank_name: string | null
  annual_interest_rate: number | string | null
}

export type SavingEntryDetailRow = {
  id: string
  account_holder: string
  bank_id: string
  principal_amount: number | string
  start_date: string
  notes: string | null
}

export type SavingEntryFormValues = {
  account_holder: string
  bank_id: string
  principal_amount: string
  start_date: string
  notes: string
}

export type SavingEntryDashboardItem = {
  id: string
  accountHolder: string
  bankName: string
  annualInterestRate: number
  principalAmount: number
  estimatedInterest: number
  estimatedTotal: number
  startDate: string
  notes: string
}

export type BankOption = {
  id: string
  name: string
  annual_interest_rate: number | string
}

export function calculateEstimatedInterest(
  principalAmount: number,
  annualInterestRate: number,
  startDate: string
) {
  const start = new Date(startDate)
  const today = new Date()
  const millisecondsPerDay = 1000 * 60 * 60 * 24
  const elapsedDays = Math.max(
    0,
    Math.floor((today.getTime() - start.getTime()) / millisecondsPerDay)
  )
  const elapsedYears = elapsedDays / 365

  return principalAmount * annualInterestRate * elapsedYears
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function mapToDashboardItems(
  rows: SavingEntryWithBankRow[]
): SavingEntryDashboardItem[] {
  return rows.map((entry) => {
    const principalAmount = Number(entry.principal_amount)
    const annualInterestRate = Number(entry.annual_interest_rate ?? 0)
    const estimatedInterest = calculateEstimatedInterest(
      principalAmount,
      annualInterestRate,
      entry.start_date
    )

    return {
      id: entry.id,
      accountHolder: entry.account_holder,
      bankName: entry.bank_name ?? 'Unknown Bank',
      annualInterestRate,
      principalAmount,
      estimatedInterest,
      estimatedTotal: principalAmount + estimatedInterest,
      startDate: entry.start_date,
      notes: entry.notes?.trim() || 'General savings goal',
    }
  })
}
