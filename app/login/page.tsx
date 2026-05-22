import { AuthForm } from '@/components/auth/auth-form'

export default function LoginPage() {
  return (
    <main className="editor-shell">
      <section className="editor-panel">
        <p className="eyebrow">Authentication</p>
        <h1 className="editor-title">Sign in to your savings tracker</h1>
        <p className="editor-copy">
          Use your Supabase Auth email and password to access your personal
          saving entries dashboard.
        </p>

        <AuthForm mode="login" />
      </section>
    </main>
  )
}
