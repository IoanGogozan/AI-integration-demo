import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '../../../components/app-shell';
import { StatusBadge } from '../../../components/status-badge';
import { getEmail } from '../../../lib/api';
import { formatDateTime, formatListCount } from '../../../lib/formatters';

export const dynamic = 'force-dynamic';

function getStatusTone(status) {
  if (status === 'needs_review') {
    return 'warning';
  }

  if (status === 'processing') {
    return 'info';
  }

  if (status === 'approved' || status === 'completed') {
    return 'success';
  }

  return 'neutral';
}

export default async function EmailDetailPage({ params }) {
  const { id } = await params;
  const email = await getEmail(id);

  if (!email) {
    notFound();
  }

  return (
    <AppShell
      eyebrow="Phase 2: Case detail"
      title={email.subject}
      description="Review the incoming request, inspect attachments, and prepare the case for AI processing."
      actions={
        <Link href="/" className="primary-link">
          Back to inbox
        </Link>
      }
    >
      <section className="detail-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Email overview</h2>
            <StatusBadge value={email.status} tone={getStatusTone(email.status)} />
          </div>

          <dl className="metadata-grid">
            <div>
              <dt>Sender</dt>
              <dd>{email.sender}</dd>
            </div>
            <div>
              <dt>Received</dt>
              <dd>{formatDateTime(email.receivedAt)}</dd>
            </div>
            <div>
              <dt>Attachments</dt>
              <dd>{formatListCount(email.attachments.length, 'file', 'files')}</dd>
            </div>
            <div>
              <dt>Current status</dt>
              <dd>{email.status.replaceAll('_', ' ')}</dd>
            </div>
          </dl>

          <div className="message-body">
            <h3>Email body</h3>
            <p>{email.body}</p>
          </div>
        </article>

        <aside className="stacked-panels">
          <section className="panel">
            <div className="panel-header">
              <h2>Attachments</h2>
              <span className="panel-kicker">Text extracted for review</span>
            </div>

            {email.attachments.length === 0 ? (
              <p className="empty-copy">No attachments are linked to this case yet.</p>
            ) : (
              <div className="attachment-list">
                {email.attachments.map((attachment) => (
                  <article className="attachment-card" key={attachment.id}>
                    <div className="attachment-title-row">
                      <strong>{attachment.fileName}</strong>
                      <span>{attachment.mimeType}</span>
                    </div>
                    <p>{attachment.extractedText || 'No extracted text available yet.'}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>AI result</h2>
              <span className="panel-kicker">Phase 4 will populate this panel</span>
            </div>

            {email.latestAiResult ? (
              <div className="result-preview">
                <div className="result-row">
                  <span>Category</span>
                  <strong>{email.latestAiResult.category}</strong>
                </div>
                <div className="result-row">
                  <span>Priority</span>
                  <strong>{email.latestAiResult.priority}</strong>
                </div>
                <div className="result-row result-block">
                  <span>Summary</span>
                  <p>{email.latestAiResult.summary}</p>
                </div>
              </div>
            ) : (
              <p className="empty-copy">
                No AI output exists yet. This case is ready for the processing endpoint in the next phase.
              </p>
            )}
          </section>
        </aside>
      </section>
    </AppShell>
  );
}
