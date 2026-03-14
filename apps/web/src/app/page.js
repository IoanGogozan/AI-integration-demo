import Link from 'next/link';
import { AppShell } from '../components/app-shell';
import { getDashboardStats, getEmails } from '../lib/api';
import { formatLabel } from '../lib/formatters';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [stats, emails] = await Promise.all([getDashboardStats(), getEmails()]);
  const featuredCase = emails.find((email) => email.latestAiResult) || emails[0] || null;
  const storyPillars = ['Email intake', 'AI classification', 'Human review'];

  const quickLinks = [
    {
      title: 'Overview',
      href: '/overview',
      description: 'Presentation-first framing for the business story and best demo cases.'
    },
    {
      title: 'Inbox',
      href: '/inbox',
      description: 'Operational queue for reading emails, uploading files, and opening cases.'
    },
    {
      title: 'Results',
      href: '/results',
      description: 'Outcome-first page for AI summaries, routes, extracted fields, and drafts.'
    },
    {
      title: 'Dashboard',
      href: '/dashboard',
      description: 'Aggregated metrics for statuses, categories, review backlog, and priorities.'
    }
  ];

  return (
    <AppShell
      eyebrow="Home"
      title="AI workflow demo home"
      description="A simple starting point for showing how incoming emails and attachments become structured operational actions for Norwegian SMB teams."
      actions={
        <Link href="/help" className="primary-link">
          Open help
        </Link>
      }
    >
      <section className="hero-grid">
        <article className="panel spotlight-panel">
          <div className="panel-header">
            <div>
              <h2>What you can show from here</h2>
              <p className="panel-copy">
                Start on the home page, jump into the inbox or results in one click, and keep the demo flow understandable for non-technical stakeholders.
              </p>
            </div>
            <span className="panel-kicker">Demo control center</span>
          </div>

          <div className="showcase-list">
            <article className="showcase-item">
              <span className="showcase-index">01</span>
              <p>Open Overview to explain the business story and show why this workflow matters.</p>
            </article>
            <article className="showcase-item">
              <span className="showcase-index">02</span>
              <p>Move to Inbox for the original email, attachment upload, AI processing, and manual review.</p>
            </article>
            <article className="showcase-item">
              <span className="showcase-index">03</span>
              <p>Use Results and Dashboard to show concrete AI output and aggregated operations value.</p>
            </article>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Live snapshot</h2>
            <span className="panel-kicker">Current seeded state</span>
          </div>
          <div className="metric-list">
            <div className="metric-row">
              <span>Total cases</span>
              <strong>{stats.totals.cases}</strong>
            </div>
            <div className="metric-row">
              <span>Processed cases</span>
              <strong>{stats.totals.processed}</strong>
            </div>
            <div className="metric-row">
              <span>Need review</span>
              <strong>{stats.totals.needsReview}</strong>
            </div>
            <div className="metric-row">
              <span>Attachments</span>
              <strong>{stats.totals.attachments}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="quick-link-grid">
        {quickLinks.map((item) => (
          <article className="panel quick-link-card" key={item.href}>
            <div className="panel-header">
              <div>
                <span className="panel-kicker">Direct path</span>
                <h2>{item.title}</h2>
              </div>
              <Link href={item.href} className="ghost-link">
                Open
              </Link>
            </div>
            <p className="panel-copy">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-strip">
        <article className="summary-card">
          <span>Inbox cases</span>
          <strong>{stats.totals.cases}</strong>
        </article>
        <article className="summary-card">
          <span>Ready results</span>
          <strong>{emails.filter((item) => item.latestAiResult).length}</strong>
        </article>
        <article className="summary-card">
          <span>Review backlog</span>
          <strong>{stats.totals.needsReview}</strong>
        </article>
        <article className="summary-card">
          <span>Help page</span>
          <strong>Ready</strong>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Featured demo case</h2>
            <p className="panel-copy">
              Use this as a quick jump into a concrete example without scanning the whole inbox first.
            </p>
          </div>
          <Link href="/inbox" className="ghost-link">
            Browse inbox
          </Link>
        </div>

        {featuredCase ? (
          <article className="feature-card">
            <div>
              <div className="pill-row">
                {storyPillars.map((item) => (
                  <span className="info-pill" key={item}>
                    {item}
                  </span>
                ))}
                {featuredCase.latestAiResult ? (
                  <>
                    <span className="info-pill">{formatLabel(featuredCase.latestAiResult.category)}</span>
                    <span className="info-pill">{formatLabel(featuredCase.latestAiResult.suggestedRoute)}</span>
                  </>
                ) : null}
              </div>
              <p className="row-title">{featuredCase.subject}</p>
              <p className="row-meta">{featuredCase.sender}</p>
              <p className="panel-copy">
                {featuredCase.latestAiResult
                  ? featuredCase.latestAiResult.summary
                  : 'Open this case to run AI processing and show the manual review workflow.'}
              </p>
            </div>

            <div className="feature-actions">
              <Link href={`/emails/${featuredCase.id}`} className="primary-link">
                Open featured case
              </Link>
              <Link href="/results" className="ghost-link">
                View all results
              </Link>
            </div>
          </article>
        ) : (
          <p className="empty-copy">No seeded cases are available right now.</p>
        )}
      </section>
    </AppShell>
  );
}
