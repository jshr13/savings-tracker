'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

import type { RegisterPayload } from '@/lib/profiles'

type AuthFormProps = {
  mode: 'login' | 'register'
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
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
    const requestPayload =
      mode === 'login'
        ? { email, password }
        : ({
            first_name: firstName,
            last_name: lastName,
            age,
            email,
            phone_number: phoneNumber,
            address,
            password,
          } satisfies RegisterPayload)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    })

    const responsePayload = (await response.json()) as {
      message?: string
      details?: string
      requiresEmailConfirmation?: boolean
    }

    setIsSubmitting(false)

    if (!response.ok) {
      setErrorMessage(
        responsePayload.details ??
          responsePayload.message ??
          'Authentication failed.'
      )
      return
    }

    if (mode === 'register' && responsePayload.requiresEmailConfirmation) {
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
      {mode === 'register' ? (
        <div className="editor-grid">
          <label className="editor-field">
            <span>First Name</span>
            <input
              className="editor-input"
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Joshua"
              required
              value={firstName}
            />
          </label>

          <label className="editor-field">
            <span>Last Name</span>
            <input
              className="editor-input"
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Rivera"
              required
              value={lastName}
            />
          </label>

          <label className="editor-field">
            <span>Age</span>
            <input
              className="editor-input"
              min="1"
              onChange={(event) => setAge(event.target.value)}
              placeholder="25"
              required
              type="number"
              value={age}
            />
          </label>

          <label className="editor-field">
            <span>Phone Number</span>
            <input
              className="editor-input"
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="09xxxxxxxxx"
              required
              value={phoneNumber}
            />
          </label>
        </div>
      ) : null}

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

      {mode === 'register' ? (
        <label className="editor-field">
          <span>Address</span>
          <textarea
            className="editor-input editor-textarea"
            onChange={(event) => setAddress(event.target.value)}
            placeholder="House number, street, barangay, city"
            required
            rows={4}
            value={address}
          />
        </label>
      ) : null}

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
