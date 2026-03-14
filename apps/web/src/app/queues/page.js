import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { StatusBadge } from '../../components/status-badge';
import { getDashboardStats, getEmails } from '../../lib/api';
import { formatDateTime, formatListCount, formatTeamLabel } from '../../lib/formatters';

export const dynamic = 'force-dynamic';

const teamFilters = ['all', 'admin', 'finance', 'legal', 'sales', 'support'];

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

export default async function QueuesPage({ searchParams }) {
  const params = await searchParams;
  const selectedTeam = params.team;
  const activeTeam = selectedTeam && selectedTeam !== 'all' ? selectedTeam : '';
  const [stats, emails] = await Promise.all([getDashboardStats(activeTeam), getEmails(activeTeam)]);

  const queueCards = activeTeam
    ? [{ key: activeTeam, count: emails.length }]
    : stats.byAssignedTeam;

  return (
    <AppShell
      eyebrow="Queues"
      title="Operational team queues"
      description="A queue-first view of routed cases so the workflow feels like real handoff automation, not only inbox classification."
      actions={
        <Link href="/dashboard" className="primary-link">
          Open dashboard
        </Link>
      }
    >
      <section className="dashboard-strip">
        <article className="summary-card">
          <span>Cases in view</span>
          <strong>{emails.length}</strong>
        </article>
        <article className="summary-card">
          <span>Need review</span>
          <strong>{emails.filter((item) => item.status === 'needs_review').length}</strong>
        </article>
        <article className="summary-card">
          <span>Approved</span>
          <strong>{emails.filter((item) => item.status === 'approved').length}</strong>
        </article>
        <article className="summary-card">
          <span>Completed</span>
          <strong>{emails.filter((item) => item.status === 'completed').length}</strong>
        </article>
      </section>

      <section className="filter-row">
        {teamFilters.map((team) => {
          const href = team === 'all' ? '/queues' : `/queues?team=${team}`;
          const isActive = (selectedTeam || 'all') === team;

          return (
            <Link className={isActive ? 'filter-chip filter-chip-active' : 'filter-chip'} href={href} key={team}>
              {team === 'all' ? 'All queues' : formatTeamLabel(team)}
            </Link>
          );
        })}
      </section>

      <section className="quick-link-grid">
        {queueCards.map((item) => (
          <article className="panel quick-link-card" key={item.key}>
            <div className="panel-header">
              <div>
                <span className="panel-kicker">Queue</span>
                <h2>{formatTeamLabel(item.key)}</h2>
              </div>
              <Link href={`/queues?team=${item.key}`} className="ghost-link">
                Open
              </Link>
            </div>
            <p className="panel-copy">{formatListCount(item.count, 'case', 'cases')} currently routed here.</p>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>{activeTeam ? `${formatTeamLabel(activeTeam)} queue` : 'All routed queues'}</h2>
            <p className="panel-copy">
              Use this page to show that the AI output becomes a team-owned operational queue, not just a suggested route.
            </p>
          </div>
          <span className="panel-kicker">{formatListCount(emails.length, 'case', 'cases')}</span>
        </div>

        {emails.length === 0 ? (
          <p className="empty-copy">No routed cases are available for this queue yet.</p>
        ) : (
          <div className="queue-list">
            {emails.map((email) => (
              <article className="queue-card" key={email.id}>
                <div className="panel-header">
                  <div>
                    <p className="row-title">{email.subject}</p>
                    <p className="row-meta">
                      {email.sender} | {formatDateTime(email.receivedAt)}
                    </p>
                  </div>
                  <StatusBadge value={email.status} tone={getStatusTone(email.status)} />
                </div>

                <div className="pill-row compact-pill-row">
                  <span className="info-pill">{formatTeamLabel(email.assignedTeam)}</span>
                  {email.latestAiResult ? (
                    <>
                      <span className="info-pill">{email.latestAiResult.category.replaceAll('_', ' ')}</span>
                      <span className="info-pill">{email.latestAiResult.priority}</span>
                    </>
                  ) : null}
                </div>

                <p className="panel-copy">
                  {email.latestAiResult
                    ? email.latestAiResult.summary
                    : 'This routed case is waiting for AI processing or manual review.'}
                </p>

                <div className="queue-card-footer">
                  <span className="row-meta">
                    {email.workflowRecord?.processedAt
                      ? `Processed ${formatDateTime(email.workflowRecord.processedAt)}`
                      : 'Not processed yet'}
                  </span>
                  <Link href={`/emails/${email.id}`} className="primary-link">
                    Open case
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
