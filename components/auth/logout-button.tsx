'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LogoutButton() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleLogout() {
    setIsSubmitting(true)

    await fetch('/api/auth/logout', {
      method: 'POST',
    })

    setIsSubmitting(false)
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      className="action-button action-button-secondary action-button-full"
      disabled={isSubmitting}
      onClick={handleLogout}
      type="button"
    >
      {isSubmitting ? 'Signing out...' : 'Sign Out'}
    </button>
  )
}
