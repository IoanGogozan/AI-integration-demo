import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { getDashboardStats, getEmails } from '../../lib/api';
import { formatDateTime } from '../../lib/formatters';

export const dynamic = 'force-dynamic';

const demoPoints = [
  'Turn incoming emails and attachments into structured workflow steps.',
  'Keep humans in control with manual review before final action.',
  'Show concrete business outputs: category, priority, route, summary, and draft reply.',
  'Connect the AI layer to a backend workflow instead of a standalone chatbot.'
];

export default async function OverviewPage() {
  const [stats, emails] = await Promise.all([getDashboardStats(), getEmails()]);
  const highlightedCases = emails.slice(0, 4);
  const processedCases = emails.filter((email) => email.latestAiResult).slice(0, 3);

  return (
    <AppShell
      eyebrow="Demo overview"
      title="AI workflow demo for Norwegian SMBs"
      description="A presentation-first view of what the product does, why it matters, and which cases are best to show in a live walkthrough."
      actions={
        <Link href="/results" className="primary-link">
          View results
        </Link>
      }
    >
      <section className="showcase-grid">
        <article className="panel spotlight-panel">
          <div className="panel-header">
            <h2>What this demo proves</h2>
            <span className="panel-kicker">Commercial framing</span>
          </div>
          <div className="showcase-list">
            {demoPoints.map((item) => (
              <article className="showcase-item" key={item}>
                <span className="showcase-index">01</span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Current demo state</h2>
            <span className="panel-kicker">Live application metrics</span>
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

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Best cases to show</h2>
            <p className="panel-copy">
              These cases are useful because they make the extracted output and routing logic easy to understand.
            </p>
          </div>
          <span className="panel-kicker">{highlightedCases.length} highlighted cases</span>
        </div>

        <div className="showcase-grid compact-grid">
          {highlightedCases.map((email) => (
            <article className="showcase-case-card" key={email.id}>
              <p className="row-title">{email.subject}</p>
              <p className="row-meta">{email.sender}</p>
              <p className="row-meta">{formatDateTime(email.receivedAt)}</p>
              <div className="card-actions">
                <Link href={`/emails/${email.id}`} className="ghost-link">
                  Open case
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Ready-made AI results</h2>
            <p className="panel-copy">
              These processed examples are useful when you want to show the final outcome immediately, without running a live processing step first.
            </p>
          </div>
          <Link href="/results" className="ghost-link">
            Open results page
          </Link>
        </div>

        {processedCases.length === 0 ? (
          <p className="empty-copy">No seeded AI results are available right now.</p>
        ) : (
          <div className="showcase-grid compact-grid">
            {processedCases.map((email) => (
              <article className="showcase-case-card" key={email.id}>
                <p className="row-title">{email.subject}</p>
                <p className="row-meta">{email.latestAiResult.category.replaceAll('_', ' ')}</p>
                <p className="row-meta">{email.latestAiResult.summary}</p>
                <div className="card-actions">
                  <Link href="/results" className="ghost-link">
                    View all results
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
