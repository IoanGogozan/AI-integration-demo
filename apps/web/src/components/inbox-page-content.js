import Link from 'next/link';
import { AppShell } from './app-shell';
import { StatusBadge } from './status-badge';
import { getEmails } from '../lib/api';
import { formatDateTime, formatListCount, formatTeamLabel } from '../lib/formatters';

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

const teamFilters = ['all', 'admin', 'finance', 'legal', 'sales', 'support'];

export async function InboxPageContent({ selectedTeam }) {
  const activeTeam = selectedTeam && selectedTeam !== 'all' ? selectedTeam : '';
  const emails = await getEmails(activeTeam);

  return (
    <AppShell
      eyebrow="Phase 2: Inbox"
      title="AI Intake Assistant"
      description="A review-ready inbox for email and document intake workflows aimed at Norwegian SMB operations teams."
      actions={
        <Link href="/help" className="ghost-link">
          How to use it
        </Link>
      }
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
        <article className="summary-card">
          <span>Processed</span>
          <strong>{emails.filter((item) => item.latestAiResult).length}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Inbox</h2>
            <p className="panel-copy">
              Seeded cases from PostgreSQL, ready for review, AI processing, and manual approval.
            </p>
          </div>
          <span className="panel-kicker">{formatListCount(emails.length, 'case', 'cases')}</span>
        </div>

        <div className="filter-row">
          {teamFilters.map((team) => {
            const href = team === 'all' ? '/inbox' : `/inbox?team=${team}`;
            const isActive = (selectedTeam || 'all') === team;

            return (
              <Link
                className={isActive ? 'filter-chip filter-chip-active' : 'filter-chip'}
                href={href}
                key={team}
              >
                {team === 'all' ? 'All teams' : formatTeamLabel(team)}
              </Link>
            );
          })}
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
              <span>Assigned</span>
              <span>Received</span>
              <span>Files</span>
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
                <div className="row-meta">{formatTeamLabel(email.assignedTeam)}</div>
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
