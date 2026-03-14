import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { getEmails } from '../../lib/api';
import { formatDateTime } from '../../lib/formatters';

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const emails = await getEmails();
  const processedEmails = emails.filter((email) => email.latestAiResult);

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
            No processed results yet. Open a case and run `Process with AI` first.
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

                <div className="result-stack">
                  <div className="metric-row">
                    <span>Category</span>
                    <strong>{email.latestAiResult.category.replaceAll('_', ' ')}</strong>
                  </div>
                  <div className="metric-row">
                    <span>Priority</span>
                    <strong>{email.latestAiResult.priority}</strong>
                  </div>
                  <div className="metric-row">
                    <span>Route</span>
                    <strong>{email.latestAiResult.suggestedRoute}</strong>
                  </div>
                  <div className="metric-row">
                    <span>Confidence</span>
                    <strong>{email.latestAiResult.confidence}</strong>
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
