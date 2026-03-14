import { PrimaryNav } from './primary-nav';

export function AppShell({ title, eyebrow, description, actions, children }) {
  return (
    <main className="page-shell">
      <PrimaryNav />

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
