import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { getEmails } from '../../lib/api';
import { formatDateTime, formatLabel } from '../../lib/formatters';

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const emails = await getEmails();
  const processedEmails = emails.filter((email) => email.latestAiResult);
  const totalResults = processedEmails.length;

  return (
    <AppShell
      eyebrow="AI results"
      title="Concrete AI output"
      description="A results-first view of the generated summaries, routes, reply drafts, and extracted fields across processed cases."
      actions={
        <Link href="/dashboard" className="primary-link">
          Open dashboard
        </Link>
      }
    >
      <section className="showcase-grid">
        <article className="panel spotlight-panel">
          <div className="panel-header">
            <h2>Why this page matters</h2>
            <span className="panel-kicker">Presentation shortcut</span>
          </div>
          <div className="metric-list">
            <div className="metric-row">
              <span>Processed results ready to show</span>
              <strong>{totalResults}</strong>
            </div>
            <div className="metric-row">
              <span>Best use</span>
              <strong>Outcome-first demos</strong>
            </div>
            <div className="metric-row">
              <span>What to highlight</span>
              <strong>Category, route, summary, draft</strong>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Suggested flow</h2>
            <span className="panel-kicker">Simple presenter mode</span>
          </div>
          <div className="showcase-list">
            <article className="showcase-item">
              <span className="showcase-index">01</span>
              <p>Open one processed result to show the final structured output immediately.</p>
            </article>
            <article className="showcase-item">
              <span className="showcase-index">02</span>
              <p>Open the linked case if the audience wants to see the original email and attachments.</p>
            </article>
            <article className="showcase-item">
              <span className="showcase-index">03</span>
              <p>Move to the dashboard to show that these outputs also roll up into operational visibility.</p>
            </article>
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Processed cases</h2>
            <p className="panel-copy">
              Use this page when you want to show the actual AI output instead of the inbox mechanics.
            </p>
          </div>
          <span className="panel-kicker">{processedEmails.length} results available</span>
        </div>

        {processedEmails.length === 0 ? (
          <p className="empty-copy">
            No processed results yet. Open a case and run Process with AI first.
          </p>
        ) : (
          <div className="result-gallery">
            {processedEmails.map((email) => (
              <article className="result-gallery-card" key={email.id}>
                <div className="panel-header">
                  <div>
                    <h3>{email.subject}</h3>
                    <p className="row-meta">
                      {email.sender} | {formatDateTime(email.receivedAt)}
                    </p>
                  </div>
                  <Link href={`/emails/${email.id}`} className="ghost-link">
                    Open case
                  </Link>
                </div>

                <div className="pill-row compact-pill-row">
                  <span className="info-pill">{formatLabel(email.latestAiResult.category)}</span>
                  <span className="info-pill">{formatLabel(email.latestAiResult.priority)}</span>
                  <span className="info-pill">{formatLabel(email.latestAiResult.suggestedRoute)}</span>
                </div>

                <div className="result-stack">
                  <div className="metric-row">
                    <span>Category</span>
                    <strong>{formatLabel(email.latestAiResult.category)}</strong>
                  </div>
                  <div className="metric-row">
                    <span>Priority</span>
                    <strong>{formatLabel(email.latestAiResult.priority)}</strong>
                  </div>
                  <div className="metric-row">
                    <span>Route</span>
                    <strong>{formatLabel(email.latestAiResult.suggestedRoute)}</strong>
                  </div>
                  <div className="metric-row">
                    <span>Confidence</span>
                    <div className="confidence-stack">
                      <strong>{email.latestAiResult.confidence}</strong>
                      <div className="confidence-bar" aria-hidden="true">
                        <span style={{ width: `${Math.round(email.latestAiResult.confidence * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="result-section">
                  <span className="panel-kicker">Summary</span>
                  <p>{email.latestAiResult.summary}</p>
                </div>

                <div className="result-section">
                  <span className="panel-kicker">Next action</span>
                  <p>{email.latestAiResult.suggestedNextAction}</p>
                </div>

                <div className="result-section">
                  <span className="panel-kicker">Reply draft</span>
                  <p>{email.latestAiResult.suggestedReply}</p>
                </div>

                <div className="result-section">
                  <span className="panel-kicker">Key extracted fields</span>
                  <div className="field-grid">
                    {Object.entries(email.latestAiResult.extractedJson || {})
                      .filter(([, value]) => value)
                      .map(([key, value]) => (
                        <div className="field-card" key={key}>
                          <span>{formatLabel(key)}</span>
                          <strong>{String(value)}</strong>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="result-section">
                  <span className="panel-kicker">Extracted fields</span>
                  <pre className="json-preview">
                    {JSON.stringify(email.latestAiResult.extractedJson, null, 2)}
                  </pre>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
