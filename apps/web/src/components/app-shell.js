import Link from 'next/link';

export function AppShell({ title, eyebrow, description, actions, children }) {
  return (
    <main className="page-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {description ? <p className="lead">{description}</p> : null}
        </div>

        <div className="header-actions">
          <Link href="/overview" className="ghost-link">
            Overview
          </Link>
          <Link href="/" className="ghost-link">
            Inbox
          </Link>
          <Link href="/results" className="ghost-link">
            Results
          </Link>
          <Link href="/dashboard" className="ghost-link">
            Dashboard
          </Link>
          {actions}
        </div>
      </header>

      {children}
    </main>
  );
}
