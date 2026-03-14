import Link from 'next/link';
import { AppShell } from '../components/app-shell';
import { StatusBadge } from '../components/status-badge';
import { getEmails } from '../lib/api';
import { formatDateTime, formatListCount } from '../lib/formatters';

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

export default async function HomePage() {
  const emails = await getEmails();

  return (
    <AppShell
      eyebrow="Phase 2: Inbox"
      title="AI Intake Assistant"
      description="A review-ready inbox for email and document intake workflows aimed at Norwegian SMB operations teams."
      actions={<span className="app-note">Use overview, results, and dashboard for the full demo narrative</span>}
    >
      <section className="dashboard-strip">
        <article className="summary-card">
          <span>Cases in inbox</span>
          <strong>{emails.length}</strong>
        </article>
        <article className="summary-card">
          <span>Need review</span>
          <strong>{emails.filter((item) => item.status === 'needs_review').length}</strong>
        </article>
        <article className="summary-card">
          <span>Attachments</span>
          <strong>
            {emails.reduce((total, item) => total + item.attachments.length, 0)}
          </strong>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Inbox</h2>
            <p className="panel-copy">
              Seeded cases from PostgreSQL, ready for review and the upcoming AI processing flow.
            </p>
          </div>
          <span className="panel-kicker">{formatListCount(emails.length, 'case', 'cases')}</span>
        </div>

        {emails.length === 0 ? (
          <p className="empty-copy">
            No cases available. Check that the API is running and that `npm run db:setup` has completed.
          </p>
        ) : (
          <div className="inbox-table">
            <div className="inbox-head">
              <span>Case</span>
              <span>Status</span>
              <span>Received</span>
              <span>Attachments</span>
              <span>Open</span>
            </div>

            {emails.map((email) => (
              <article className="inbox-row" key={email.id}>
                <div>
                  <p className="row-title">{email.subject}</p>
                  <p className="row-meta">{email.sender}</p>
                </div>
                <div>
                  <StatusBadge value={email.status} tone={getStatusTone(email.status)} />
                </div>
                <div className="row-meta">{formatDateTime(email.receivedAt)}</div>
                <div className="row-meta">
                  {formatListCount(email.attachments.length, 'file', 'files')}
                </div>
                <div>
                  <Link href={`/emails/${email.id}`} className="primary-link">
                    Review case
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
