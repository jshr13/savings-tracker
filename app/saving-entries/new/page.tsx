import { SavingEntryForm } from '@/components/saving-entries/form'
import { getRequestCookieHeader, getRequestOrigin } from '@/lib/server-api'
import type { BankOption, SavingEntryFormValues } from '@/lib/saving-entries'

const emptyFormValues: SavingEntryFormValues = {
  account_holder: '',
  bank_id: '',
  principal_amount: '',
  start_date: '',
  notes: '',
}

export default async function NewSavingEntryPage() {
  const origin = await getRequestOrigin()
  const cookieHeader = await getRequestCookieHeader()
  const banksResponse = await fetch(`${origin}/api/banks`, {
    cache: 'no-store',
    headers: {
      cookie: cookieHeader,
    },
  })

  if (!banksResponse.ok) {
    const errorPayload = (await banksResponse.json()) as {
      details?: string
      message?: string
    }

    return (
      <div>
        Error loading banks:{' '}
        {errorPayload.details ?? errorPayload.message ?? 'Unknown error'}
      </div>
    )
  }

  const banks = (await banksResponse.json()) as BankOption[]

  return (
    <main className="editor-shell">
      <section className="editor-panel">
        <p className="eyebrow">Create</p>
        <h1 className="editor-title">New Saving Entry</h1>
        <p className="editor-copy">
          The page only handles display and form interaction. The actual create
          action goes to `POST /api/saving-entries`, then the API route calls
          the create RPC in Supabase.
        </p>

        <SavingEntryForm
          banks={banks}
          initialValues={emptyFormValues}
          mode="create"
        />
      </section>
    </main>
  )
}
