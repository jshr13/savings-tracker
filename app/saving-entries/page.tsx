import Link from 'next/link'

import { LogoutButton } from '@/components/auth/logout-button'
import { DeleteSavingEntryButton } from '@/components/saving-entries/delete-button'
import { getRequestCookieHeader, getRequestOrigin } from '@/lib/server-api'
import {
  formatCurrency,
  formatDate,
  formatPercent,
  mapToDashboardItems,
  type SavingEntryWithBankRow,
} from '@/lib/saving-entries'
import { createClient } from '@/utils/supabase/server'

export default async function SavingEntriesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Unauthorized.</div>
  }

  const origin = await getRequestOrigin()
  const cookieHeader = await getRequestCookieHeader()
  const response = await fetch(`${origin}/api/saving-entries`, {
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
        Error loading saving entries:{' '}
        {errorPayload.details ?? errorPayload.message ?? 'Unknown error'}
      </div>
    )
  }

  const savingEntries = (await response.json()) as SavingEntryWithBankRow[]
  const entries = mapToDashboardItems(savingEntries)
  const totalPrincipal = entries.reduce((sum, entry) => sum + entry.principalAmount, 0)
  const totalEstimatedInterest = entries.reduce(
    (sum, entry) => sum + entry.estimatedInterest,
    0
  )
  const averageRate =
    entries.length === 0
      ? 0
      : entries.reduce((sum, entry) => sum + entry.annualInterestRate, 0) /
        entries.length
  const recentFeed = entries.slice(0, 4)

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div>
          <p className="sidebar-kicker">Savings Tracker</p>
          <h1 className="sidebar-title">Authenticated Dashboard</h1>
          <p className="sidebar-copy">
            Signed in as {user.email}. These saving entries belong only to the
            current authenticated user.
          </p>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          <a className="sidebar-link sidebar-link-active" href="#overview">
            Overview
          </a>
          <a className="sidebar-link" href="#entries">
            Entries
          </a>
          <a className="sidebar-link" href="#activity">
            Activity Feed
          </a>
        </nav>

        <div className="sidebar-stack">
          <Link className="action-button action-button-primary action-button-full" href="/saving-entries/new">
            New Saving Entry
          </Link>
          <LogoutButton />
        </div>

        <div className="sidebar-card">
          <p className="sidebar-card-label">Checkpoint</p>
          <p className="sidebar-card-value">{entries.length} entry(s)</p>
          <p className="sidebar-card-copy">
            Auth is active and the CRUD flow is now scoped to the signed-in user.
          </p>
        </div>
      </aside>

      <section className="dashboard-content">
        <section className="hero-panel" id="overview">
          <div>
            <p className="eyebrow">Current Phase</p>
            <h2 className="hero-title">User-owned saving entries</h2>
            <p className="hero-copy">
              Authentication lives in Supabase Auth. The display pages use API
              routes, and the API routes call RPC functions that work against
              the current authenticated user.
            </p>
          </div>
          <div className="hero-badge">Auth + API + RPC</div>
        </section>

        <section className="summary-grid" aria-label="Summary cards">
          <article className="summary-card">
            <p className="summary-label">Total Principal</p>
            <p className="summary-value">{formatCurrency(totalPrincipal)}</p>
            <p className="summary-copy">Total money tracked under this user.</p>
          </article>

          <article className="summary-card">
            <p className="summary-label">Estimated Interest</p>
            <p className="summary-value">
              {formatCurrency(totalEstimatedInterest)}
            </p>
            <p className="summary-copy">
              Simple interest based on elapsed time and bank rate.
            </p>
          </article>

          <article className="summary-card">
            <p className="summary-label">Average Bank Rate</p>
            <p className="summary-value">{formatPercent(averageRate)}</p>
            <p className="summary-copy">
              Average annual rate across the current user&apos;s entries.
            </p>
          </article>
        </section>

        <section className="content-grid">
          <section className="panel panel-large" id="entries">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Entries</p>
                <h3 className="panel-title">Saving Entries</h3>
              </div>
              <div className="panel-pill">{entries.length} loaded</div>
            </div>

            {entries.length === 0 ? (
              <p className="empty-state">
                No saving entries found. Create your first one to start tracking
                interest.
              </p>
            ) : (
              <div className="account-list">
                {entries.map((entry) => (
                  <article className="account-card" key={entry.id}>
                    <div className="account-row">
                      <div>
                        <h4 className="account-name">{entry.accountHolder}</h4>
                        <p className="account-bank">{entry.bankName}</p>
                      </div>
                      <div className="account-rate">
                        {formatPercent(entry.annualInterestRate)}
                      </div>
                    </div>

                    <div className="account-metrics">
                      <div>
                        <p className="metric-label">Principal</p>
                        <p className="metric-value">
                          {formatCurrency(entry.principalAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="metric-label">Interest</p>
                        <p className="metric-value">
                          {formatCurrency(entry.estimatedInterest)}
                        </p>
                      </div>
                      <div>
                        <p className="metric-label">Estimated Total</p>
                        <p className="metric-value">
                          {formatCurrency(entry.estimatedTotal)}
                        </p>
                      </div>
                    </div>

                    <div className="account-footer">
                      <span>Started {formatDate(entry.startDate)}</span>
                      <span>{entry.notes}</span>
                    </div>

                    <div className="account-actions">
                      <Link
                        className="action-button action-button-secondary"
                        href={`/saving-entries/${entry.id}/edit`}
                      >
                        Edit
                      </Link>
                      <DeleteSavingEntryButton id={entry.id} />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="panel" id="activity">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Feed</p>
                <h3 className="panel-title">Recent Activity</h3>
              </div>
            </div>

            {recentFeed.length === 0 ? (
              <p className="empty-state">
                No activity yet. Create a saving entry to generate feed items.
              </p>
            ) : (
              <div className="feed-list">
                {recentFeed.map((entry) => (
                  <article className="feed-item" key={entry.id}>
                    <div className="feed-dot" aria-hidden="true" />
                    <div>
                      <p className="feed-title">
                        Saving entry for {entry.accountHolder}
                      </p>
                      <p className="feed-copy">
                        Posted to {entry.bankName} with{' '}
                        {formatCurrency(entry.principalAmount)} principal.
                      </p>
                      <p className="feed-meta">
                        {formatDate(entry.startDate)} · Goal: {entry.notes}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  )
}
