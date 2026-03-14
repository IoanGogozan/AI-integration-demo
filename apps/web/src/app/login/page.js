import { redirect } from 'next/navigation';
import { LoginForm } from '../../components/login-form';
import { getAppSession } from '../../lib/auth';

export default async function LoginPage() {
  const session = await getAppSession();

  if (session) {
    redirect('/');
  }

  return (
    <main className="auth-page-shell">
      <section className="auth-card">
        <p className="eyebrow">Demo login</p>
        <h1>Sign in to the AI workflow demo</h1>
        <p className="lead">
          This demo uses a single operator account so the workflow pages stay private behind the backend session.
        </p>

        <div className="auth-hint">
          <strong>Default demo account</strong>
          <p>Email: `demo@norvix.ai`</p>
          <p>Password: `demo1234`</p>
        </div>

        <LoginForm />

        <p className="auth-copy">
          You can change these credentials in `.env` with `DEMO_AUTH_EMAIL`, `DEMO_AUTH_PASSWORD`, and `DEMO_AUTH_NAME`.
        </p>
        <p className="auth-copy">The full help page becomes available after sign-in.</p>
      </section>
    </main>
  );
}
