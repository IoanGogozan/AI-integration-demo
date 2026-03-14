import { PrimaryNav } from './primary-nav';
import { requireAppSession } from '../lib/auth';

export async function AppShell({ title, eyebrow, description, actions, children }) {
  const session = await requireAppSession();

  return (
    <main className="page-shell">
      <PrimaryNav session={session} />

      <header className="app-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {description ? <p className="lead">{description}</p> : null}
        </div>

        <div className="header-actions">{actions}</div>
      </header>

      {children}
    </main>
  );
}
