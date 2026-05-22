import { notFound } from 'next/navigation'

import { SavingEntryForm } from '@/components/saving-entries/form'
import { getRequestCookieHeader, getRequestOrigin } from '@/lib/server-api'
import type {
  BankOption,
  SavingEntryDetailRow,
  SavingEntryFormValues,
} from '@/lib/saving-entries'

type EditPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditSavingEntryPage({ params }: EditPageProps) {
  const { id } = await params
  const origin = await getRequestOrigin()
  const cookieHeader = await getRequestCookieHeader()

  const [banksResponse, entryResponse] = await Promise.all([
    fetch(`${origin}/api/banks`, {
      cache: 'no-store',
      headers: {
        cookie: cookieHeader,
      },
    }),
    fetch(`${origin}/api/saving-entries/${id}`, {
      cache: 'no-store',
      headers: {
        cookie: cookieHeader,
      },
    }),
  ])

  if (entryResponse.status === 404) {
    notFound()
  }

  if (!banksResponse.ok || !entryResponse.ok) {
    return <div>Error loading edit form data.</div>
  }

  const banks = (await banksResponse.json()) as BankOption[]
  const entry = (await entryResponse.json()) as SavingEntryDetailRow

  const initialValues: SavingEntryFormValues = {
    account_holder: entry.account_holder,
    bank_id: entry.bank_id,
    principal_amount: String(entry.principal_amount),
    start_date: entry.start_date,
    notes: entry.notes ?? '',
  }

  return (
    <main className="editor-shell">
      <section className="editor-panel">
        <p className="eyebrow">Update</p>
        <h1 className="editor-title">Edit Saving Entry</h1>
        <p className="editor-copy">
          This page fetches the current record from the API, then sends updates
          to `PATCH /api/saving-entries/{id}`. The API route calls the update
          RPC in Supabase.
        </p>

        <SavingEntryForm
          banks={banks}
          initialValues={initialValues}
          mode="edit"
          savingEntryId={id}
        />
      </section>
    </main>
  )
}
