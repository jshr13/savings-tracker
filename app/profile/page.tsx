import Link from 'next/link'

import { LogoutButton } from '@/components/auth/logout-button'
import { ProfileForm } from '@/components/profile/profile-form'
import { getRequestCookieHeader, getRequestOrigin } from '@/lib/server-api'
import type { ProfileFormValues } from '@/lib/profiles'
import { createClient } from '@/utils/supabase/server'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Unauthorized.</div>
  }

  const origin = await getRequestOrigin()
  const cookieHeader = await getRequestCookieHeader()
  const response = await fetch(`${origin}/api/profile`, {
    cache: 'no-store',
    headers: {
      cookie: cookieHeader,
    },
  })

  if (!response.ok) {
    const errorPayload = (await response.json()) as {
      details?: string
      message?: string
    }

    return (
      <div>
        Error loading profile:{' '}
        {errorPayload.details ?? errorPayload.message ?? 'Unknown error'}
      </div>
    )
  }

  const initialValues = (await response.json()) as ProfileFormValues

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div>
          <p className="sidebar-kicker">Profile</p>
          <h1 className="sidebar-title">Account Settings</h1>
          <p className="sidebar-copy">
            Signed in as {user.email}. You can update your personal profile
            information here.
          </p>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          <Link className="sidebar-link" href="/saving-entries">
            Saving Entries
          </Link>
          <span className="sidebar-link sidebar-link-active">Profile</span>
        </nav>

        <div className="sidebar-stack">
          <Link
            className="action-button action-button-primary action-button-full"
            href="/saving-entries"
          >
            Back to Dashboard
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <section className="dashboard-content">
        <section className="hero-panel">
          <div>
            <p className="eyebrow">Profile</p>
            <h2 className="hero-title">Manage your personal information</h2>
            <p className="hero-copy">
              This page updates the `profiles` table and can also request an
              auth email change through Supabase Auth.
            </p>
          </div>
          <div className="hero-badge">Authenticated User</div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Edit</p>
              <h3 className="panel-title">Profile Details</h3>
            </div>
          </div>

          <ProfileForm initialValues={initialValues} />
        </section>
      </section>
    </main>
  )
}
