'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

type AuthFormProps = {
  mode: 'login' | 'register'
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const payload = (await response.json()) as {
      message?: string
      details?: string
      requiresEmailConfirmation?: boolean
    }

    setIsSubmitting(false)

    if (!response.ok) {
      setErrorMessage(payload.details ?? payload.message ?? 'Authentication failed.')
      return
    }

    if (mode === 'register' && payload.requiresEmailConfirmation) {
      setSuccessMessage(
        'Registration succeeded. Check your email to confirm your account before logging in.'
      )
      return
    }

    router.push('/saving-entries')
    router.refresh()
  }

  return (
    <form className="editor-form" onSubmit={handleSubmit}>
      <label className="editor-field">
        <span>Email</span>
        <input
          className="editor-input"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
      </label>

      <label className="editor-field">
        <span>Password</span>
        <input
          className="editor-input"
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
          required
          type="password"
          value={password}
        />
      </label>

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      {successMessage ? <p className="form-success">{successMessage}</p> : null}

      <div className="editor-actions">
        <button className="action-button action-button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting
            ? mode === 'login'
              ? 'Signing in...'
              : 'Registering...'
            : mode === 'login'
              ? 'Sign In'
              : 'Create Account'}
        </button>

        {mode === 'login' ? (
          <Link className="action-button action-button-secondary" href="/register">
            Need an account?
          </Link>
        ) : (
          <Link className="action-button action-button-secondary" href="/login">
            Back to login
          </Link>
        )}
      </div>
    </form>
  )
}
