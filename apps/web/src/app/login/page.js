import { redirect } from 'next/navigation';
import { getAppSession } from '../../lib/auth';
import { LoginFormShell } from '../../components/login-form-shell';

export default async function LoginPage() {
  const session = await getAppSession();

  if (session) {
    redirect('/');
  }

  return (
    <main className="auth-page-shell">
      <section className="auth-card">
        <p className="eyebrow">Sign in</p>
        <h1>Open the workflow</h1>
        <p className="lead">
          Sign in to open cases, run AI, review the result, and check which team should handle the case next.
        </p>

        <div className="auth-hint">
          <strong>Test accounts</strong>
          <p>Operator: demo@norvix.ai / demo1234</p>
          <p>Reviewer: reviewer@norvix.ai / review1234</p>
          <p>Viewer: viewer@norvix.ai / view1234</p>
          <p>Admin: admin@norvix.ai / admin1234</p>
        </div>

        <LoginFormShell />

        <p className="auth-copy">
          You can change these sign-in details in `.env` with the `DEMO_AUTH_*` variables or provide `DEMO_AUTH_USERS_JSON`.
        </p>
        <p className="auth-copy">Use Inbox first if you want the simplest way to test the workflow.</p>
      </section>
    </main>
  );
}
