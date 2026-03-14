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
          <Link href="/" className="ghost-link">
            Inbox
          </Link>
          {actions}
        </div>
      </header>

      {children}
    </main>
  );
}
