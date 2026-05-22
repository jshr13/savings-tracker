import { AuthForm } from '@/components/auth/auth-form'

export default function RegisterPage() {
  return (
    <main className="editor-shell">
      <section className="editor-panel">
        <p className="eyebrow">Authentication</p>
        <h1 className="editor-title">Create your account</h1>
        <p className="editor-copy">
          Register with email and password. Once signed in, you will only see
          your own saving entries and be able to create, update, and delete
          them.
        </p>

        <AuthForm mode="register" />
      </section>
    </main>
  )
}
