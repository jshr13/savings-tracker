'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

import type { ProfileFormValues } from '@/lib/profiles'

type ProfileFormProps = {
  initialValues: ProfileFormValues
}

export function ProfileForm({ initialValues }: ProfileFormProps) {
  const router = useRouter()
  const [formValues, setFormValues] = useState(initialValues)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formValues),
    })

    const payload = (await response.json()) as {
      details?: string
      message?: string
      emailRequiresConfirmation?: boolean
    }

    setIsSubmitting(false)

    if (!response.ok) {
      setErrorMessage(payload.details ?? payload.message ?? 'Profile update failed.')
      return
    }

    setSuccessMessage(
      payload.emailRequiresConfirmation
        ? 'Profile updated. Check your email to confirm the new email address.'
        : 'Profile updated successfully.'
    )
    router.refresh()
  }

  return (
    <form className="editor-form" onSubmit={handleSubmit}>
      <div className="editor-grid">
        <label className="editor-field">
          <span>First Name</span>
          <input
            className="editor-input"
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                first_name: event.target.value,
              }))
            }
            required
            value={formValues.first_name}
          />
        </label>

        <label className="editor-field">
          <span>Last Name</span>
          <input
            className="editor-input"
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                last_name: event.target.value,
              }))
            }
            required
            value={formValues.last_name}
          />
        </label>

        <label className="editor-field">
          <span>Age</span>
          <input
            className="editor-input"
            min="1"
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                age: event.target.value,
              }))
            }
            required
            type="number"
            value={formValues.age}
          />
        </label>

        <label className="editor-field">
          <span>Phone Number</span>
          <input
            className="editor-input"
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                phone_number: event.target.value,
              }))
            }
            required
            value={formValues.phone_number}
          />
        </label>
      </div>

      <label className="editor-field">
        <span>Email</span>
        <input
          className="editor-input"
          onChange={(event) =>
            setFormValues((current) => ({
              ...current,
              email: event.target.value,
            }))
          }
          required
          type="email"
          value={formValues.email}
        />
      </label>

      <label className="editor-field">
        <span>Address</span>
        <textarea
          className="editor-input editor-textarea"
          onChange={(event) =>
            setFormValues((current) => ({
              ...current,
              address: event.target.value,
            }))
          }
          required
          rows={4}
          value={formValues.address}
        />
      </label>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      {successMessage ? <p className="form-success">{successMessage}</p> : null}

      <div className="editor-actions">
        <button
          className="action-button action-button-primary"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  )
}
