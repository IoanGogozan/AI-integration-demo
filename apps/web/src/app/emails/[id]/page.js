import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AttachmentUploadForm } from '../../../components/attachment-upload-form';
import { AppShell } from '../../../components/app-shell';
import { ProcessCaseButton } from '../../../components/process-case-button';
import { ReviewPanel } from '../../../components/review-panel';
import { StatusBadge } from '../../../components/status-badge';
import { requireAppSession } from '../../../lib/auth';
import { getEmail } from '../../../lib/api';
import { formatDateTime, formatLabel, formatListCount } from '../../../lib/formatters';
import { canProcessCases, canReviewCases, canUploadAttachments, formatRoleLabel } from '../../../lib/permissions';

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
  const session = await requireAppSession();
  const email = await getEmail(id);
  const canUpload = canUploadAttachments(session.role);
  const canProcess = canProcessCases(session.role);
  const canReview = canReviewCases(session.role);

  if (!email) {
    notFound();
  }

  return (
    <AppShell
      eyebrow="Phase 2: Case detail"
      title={email.subject}
      description="Review the incoming request, inspect attachments, and prepare the case for AI processing."
      actions={
        <>
          <span className="app-note">Signed in as {formatRoleLabel(session.role)}</span>
          <Link href="/inbox" className="primary-link">
            Back to inbox
          </Link>
        </>
      }
    >
      <section className="detail-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Email overview</h2>
            <StatusBadge value={email.status} tone={getStatusTone(email.status)} />
          </div>

          {email.latestAiResult ? (
            <div className="callout-banner">
              <div className="pill-row compact-pill-row">
                <span className="info-pill">{formatLabel(email.latestAiResult.category)}</span>
                <span className="info-pill">{formatLabel(email.latestAiResult.priority)}</span>
                <span className="info-pill">{formatLabel(email.latestAiResult.suggestedRoute)}</span>
              </div>
              <p>{email.latestAiResult.summary}</p>
            </div>
          ) : null}

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

            <AttachmentUploadForm
              emailId={email.id}
              disabled={!canUpload}
              disabledMessage="Your role can view attachments, but only operator, reviewer, or admin accounts can upload files."
            />

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
              <span className="panel-kicker">
                {email.latestAiResult ? 'Latest stored result' : 'Run AI to generate output'}
              </span>
            </div>

            <ProcessCaseButton
              emailId={email.id}
              disabled={!canProcess}
              disabledMessage="Your role is read-only for AI processing. Use an operator, reviewer, or admin account to run the workflow."
            />

            {email.latestAiResult ? (
              <div className="result-preview">
                <div className="result-row">
                  <span>Category</span>
                  <strong>{formatLabel(email.latestAiResult.category)}</strong>
                </div>
                <div className="result-row">
                  <span>Priority</span>
                  <strong>{formatLabel(email.latestAiResult.priority)}</strong>
                </div>
                <div className="result-row result-block">
                  <span>Summary</span>
                  <p>{email.latestAiResult.summary}</p>
                </div>
                <div className="result-row">
                  <span>Route</span>
                  <strong>{formatLabel(email.latestAiResult.suggestedRoute)}</strong>
                </div>
                <div className="result-row">
                  <span>Confidence</span>
                  <div className="confidence-stack">
                    <strong>{email.latestAiResult.confidence}</strong>
                    <div className="confidence-bar" aria-hidden="true">
                      <span style={{ width: `${Math.round(email.latestAiResult.confidence * 100)}%` }} />
                    </div>
                  </div>
                </div>
                <div className="result-row result-block">
                  <span>Next action</span>
                  <p>{email.latestAiResult.suggestedNextAction}</p>
                </div>
                <div className="result-row result-block">
                  <span>Reply draft</span>
                  <p>{email.latestAiResult.suggestedReply}</p>
                </div>
                <div className="result-row result-block">
                  <span>Key fields</span>
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
                <div className="result-row result-block">
                  <span>Extracted fields</span>
                  <pre className="json-preview">
                    {JSON.stringify(email.latestAiResult.extractedJson, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="empty-copy">
                No AI output exists yet. Use the button above to process the case and store the structured result.
              </p>
            )}
          </section>

          {email.latestAiResult && canReview ? (
            <ReviewPanel
              aiResult={email.latestAiResult}
              currentStatus={email.status}
              emailId={email.id}
            />
          ) : email.latestAiResult ? (
            <section className="panel">
              <div className="panel-header">
                <h2>Manual review</h2>
                <span className="panel-kicker">Read-only for your role</span>
              </div>
              <p className="empty-copy">
                Viewer and operator accounts can inspect the AI result, but only reviewer or admin accounts can edit review fields and change the final workflow status.
              </p>
            </section>
          ) : null}
        </aside>
      </section>
    </AppShell>
  );
}
