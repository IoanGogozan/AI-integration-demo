import { redirect } from 'next/navigation';
import { getAppSession } from '../../lib/auth';
import { getLocalizationSummary } from '../../lib/localization';
import { LoginFormShell } from '../../components/login-form-shell';

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
          This demo uses lightweight role-based access so workflow pages stay private and the review actions can be shown with different permissions.
        </p>

        <div className="auth-hint">
          <strong>Default demo accounts</strong>
          <p>Operator: demo@norvix.ai / demo1234</p>
          <p>Reviewer: reviewer@norvix.ai / review1234</p>
          <p>Viewer: viewer@norvix.ai / view1234</p>
          <p>Admin: admin@norvix.ai / admin1234</p>
        </div>

        <LoginFormShell />

        <p className="auth-copy">
          You can change these credentials in `.env` with the `DEMO_AUTH_*` variables or provide a full `DEMO_AUTH_USERS_JSON`.
        </p>
        <p className="auth-copy">{getLocalizationSummary()}</p>
        <p className="auth-copy">The full help page becomes available after sign-in.</p>
      </section>
    </main>
  );
}
