import Link from 'next/link';
import { AppShell } from '../components/app-shell';
import { getDashboardStats, getEmails } from '../lib/api';
import { formatLabel, formatTeamLabel } from '../lib/formatters';

export const dynamic = 'force-dynamic';

const workflowMessage =
  'Open a case, run AI, review the result, and see which team should handle it next.';

export default async function HomePage() {
  const [stats, emails] = await Promise.all([getDashboardStats(), getEmails()]);
  const featuredCase = emails.find((email) => email.latestAiResult) || emails[0] || null;
  const storyPillars = ['What comes in', 'What AI does', 'What happens next'];

  return (
    <AppShell
      eyebrow="Home"
      title="Test the workflow"
      description={workflowMessage}
      actions={
        <>
          <Link href="/inbox" className="primary-link">
            Try the workflow
          </Link>
          <Link href="/results" className="ghost-link">
            See processed examples
          </Link>
        </>
      }
    >
      <section className="hero-grid">
        <article className="panel spotlight-panel">
          <div className="panel-header">
            <div>
              <h2>What this demo does</h2>
              <p className="panel-copy">
                Reads incoming emails and attachments, extracts key business information, suggests the right team, and saves the result in a simple workflow.
              </p>
            </div>
            <span className="panel-kicker">Main workflow</span>
          </div>

          <div className="pill-row">
            {storyPillars.map((item) => (
              <span className="info-pill" key={item}>
                {item}
              </span>
            ))}
          </div>

          <div className="showcase-list">
            <article className="showcase-item">
              <span className="showcase-index">01</span>
              <p>Open Inbox and choose a case.</p>
            </article>
            <article className="showcase-item">
              <span className="showcase-index">02</span>
              <p>Open the case and run AI to extract category, priority, route, summary, and reply draft.</p>
            </article>
            <article className="showcase-item">
              <span className="showcase-index">03</span>
              <p>Review the result, then open Queues to see which team should handle the case next.</p>
            </article>
            <article className="showcase-item">
              <span className="showcase-index">04</span>
              <p>Use Dashboard only after that, when you want to show operational visibility across many cases.</p>
            </article>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>How to test it</h2>
            <span className="panel-kicker">Fastest path</span>
          </div>
          <div className="showcase-list">
            <article className="showcase-item">
              <span className="showcase-index">A</span>
              <p>Open Inbox.</p>
            </article>
            <article className="showcase-item">
              <span className="showcase-index">B</span>
              <p>Select a case.</p>
            </article>
            <article className="showcase-item">
              <span className="showcase-index">C</span>
              <p>Click Process with AI.</p>
            </article>
            <article className="showcase-item">
              <span className="showcase-index">D</span>
              <p>Review the result and open Queues.</p>
            </article>
          </div>
        </article>
      </section>

      <section className="dashboard-strip">
        <article className="summary-card">
          <span>Cases ready to test</span>
          <strong>{stats.totals.cases}</strong>
        </article>
        <article className="summary-card">
          <span>Processed examples</span>
          <strong>{emails.filter((item) => item.latestAiResult).length}</strong>
        </article>
        <article className="summary-card">
          <span>Review backlog</span>
          <strong>{stats.totals.needsReview}</strong>
        </article>
        <article className="summary-card">
          <span>Routed teams</span>
          <strong>{stats.byAssignedTeam.length}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>What you should expect to see</h2>
            <p className="panel-copy">
              The AI reads the message, extracts key details, suggests a route, and saves the case in a simple workflow record.
            </p>
          </div>
          <span className="panel-kicker">Expected result</span>
        </div>
        <div className="metric-list">
            <div className="metric-row">
              <span>Incoming case</span>
              <strong>Email + attachment</strong>
            </div>
            <div className="metric-row">
              <span>AI output</span>
              <strong>Category, route, summary</strong>
            </div>
            <div className="metric-row">
              <span>Human step</span>
              <strong>Review and approval</strong>
            </div>
            <div className="metric-row">
              <span>Next handoff</span>
              <strong>Queue ownership</strong>
            </div>
          </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Start with this case</h2>
            <p className="panel-copy">
              This is the fastest way to test the workflow without browsing the full inbox first.
            </p>
          </div>
          <Link href="/inbox" className="ghost-link">
            Open inbox
          </Link>
        </div>

        {featuredCase ? (
          <article className="feature-card">
            <div>
              <div className="pill-row">
                {featuredCase.assignedTeam ? (
                  <span className="info-pill">Queue: {formatTeamLabel(featuredCase.assignedTeam)}</span>
                ) : null}
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
                  : 'Open this case, run AI, review the result, and then open Queues to see the handoff.'}
              </p>
            </div>

            <div className="feature-actions">
              <Link href={`/emails/${featuredCase.id}`} className="primary-link">
                Open case
              </Link>
              <Link href="/queues" className="ghost-link">
                Open queues
              </Link>
            </div>
          </article>
        ) : (
          <p className="empty-copy">No cases are available right now.</p>
        )}
      </section>
    </AppShell>
  );
}
