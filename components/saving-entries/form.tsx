'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

import type { BankOption, SavingEntryFormValues } from '@/lib/saving-entries'

type SavingEntryFormProps = {
  banks: BankOption[]
  initialValues: SavingEntryFormValues
  mode: 'create' | 'edit'
  savingEntryId?: string
}

export function SavingEntryForm({
  banks,
  initialValues,
  mode,
  savingEntryId,
}: SavingEntryFormProps) {
  const router = useRouter()
  const [formValues, setFormValues] = useState(initialValues)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    const endpoint =
      mode === 'create'
        ? '/api/saving-entries'
        : `/api/saving-entries/${savingEntryId}`
    const method = mode === 'create' ? 'POST' : 'PATCH'

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formValues),
    })

    setIsSubmitting(false)

    if (!response.ok) {
      const payload = (await response.json()) as { details?: string; message?: string }
      setErrorMessage(payload.details ?? payload.message ?? 'Request failed.')
      return
    }

    router.push('/saving-entries')
    router.refresh()
  }

  return (
    <form className="editor-form" onSubmit={handleSubmit}>
      <div className="editor-grid">
        <label className="editor-field">
          <span>Account Holder</span>
          <input
            className="editor-input"
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                account_holder: event.target.value,
              }))
            }
            placeholder="Ex. Joshua"
            required
            value={formValues.account_holder}
          />
        </label>

        <label className="editor-field">
          <span>Bank</span>
          <select
            className="editor-input"
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                bank_id: event.target.value,
              }))
            }
            required
            value={formValues.bank_id}
          >
            <option value="">Select a bank</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name} ({Number(bank.annual_interest_rate) * 100}%)
              </option>
            ))}
          </select>
        </label>

        <label className="editor-field">
          <span>Principal Amount</span>
          <input
            className="editor-input"
            min="0"
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                principal_amount: event.target.value,
              }))
            }
            placeholder="10000"
            required
            step="0.01"
            type="number"
            value={formValues.principal_amount}
          />
        </label>

        <label className="editor-field">
          <span>Start Date</span>
          <input
            className="editor-input"
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                start_date: event.target.value,
              }))
            }
            required
            type="date"
            value={formValues.start_date}
          />
        </label>
      </div>

      <label className="editor-field">
        <span>Reason / Notes</span>
        <textarea
          className="editor-input editor-textarea"
          onChange={(event) =>
            setFormValues((current) => ({
              ...current,
              notes: event.target.value,
            }))
          }
          placeholder="Ex. Emergency fund, tuition, travel, or general savings goal"
          rows={5}
          value={formValues.notes}
        />
      </label>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <div className="editor-actions">
        <button className="action-button action-button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting
            ? mode === 'create'
              ? 'Creating...'
              : 'Updating...'
            : mode === 'create'
              ? 'Create Saving Entry'
              : 'Update Saving Entry'}
        </button>

        <Link className="action-button action-button-secondary" href="/saving-entries">
          Cancel
        </Link>
      </div>
    </form>
  )
}
