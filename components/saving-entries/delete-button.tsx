'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteSavingEntryButton({ id }: { id: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm(
      'Delete this saving entry? This action cannot be undone.'
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(true)

    const response = await fetch(`/api/saving-entries/${id}`, {
      method: 'DELETE',
    })

    setIsDeleting(false)

    if (!response.ok) {
      const payload = (await response.json()) as { details?: string; message?: string }
      window.alert(payload.details ?? payload.message ?? 'Delete failed.')
      return
    }

    router.refresh()
  }

  return (
    <button
      className="action-button action-button-danger"
      disabled={isDeleting}
      onClick={handleDelete}
      type="button"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}
