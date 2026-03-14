import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { StatusBadge } from '../../components/status-badge';
import { getDashboardStats } from '../../lib/api';
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

export default async function DashboardPage({ searchParams }) {
  const params = await searchParams;
  const selectedTeam = params.team;
  const activeTeam = selectedTeam && selectedTeam !== 'all' ? selectedTeam : '';
  const stats = await getDashboardStats(activeTeam);

  return (
    <AppShell
      eyebrow="Phase 6: Dashboard"
      title="Workflow dashboard"
      description="A compact operations view for demo metrics, AI processing output, and cases that still need attention."
      actions={
        <Link href="/inbox" className="primary-link">
          Back to inbox
        </Link>
      }
    >
      <section className="dashboard-strip">
        <article className="summary-card">
          <span>Total cases</span>
          <strong>{stats.totals.cases}</strong>
        </article>
        <article className="summary-card">
          <span>Processed cases</span>
          <strong>{stats.totals.processed}</strong>
        </article>
        <article className="summary-card">
          <span>Need review</span>
          <strong>{stats.totals.needsReview}</strong>
        </article>
        <article className="summary-card">
          <span>Attachments</span>
          <strong>{stats.totals.attachments}</strong>
        </article>
      </section>

      <section className="filter-row">
        {teamFilters.map((team) => {
          const href = team === 'all' ? '/dashboard' : `/dashboard?team=${team}`;
          const isActive = (selectedTeam || 'all') === team;

          return (
            <Link className={isActive ? 'filter-chip filter-chip-active' : 'filter-chip'} href={href} key={team}>
              {team === 'all' ? 'All teams' : formatTeamLabel(team)}
            </Link>
          );
        })}
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Status mix</h2>
            <span className="panel-kicker">
              {formatListCount(stats.byStatus.length, 'status', 'statuses')}
            </span>
          </div>
          <div className="metric-list">
            {stats.byStatus.map((item) => (
              <div className="metric-row" key={item.key}>
                <span>{item.key.replaceAll('_', ' ')}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Category mix</h2>
            <span className="panel-kicker">
              {formatListCount(stats.byCategory.length, 'category', 'categories')}
            </span>
          </div>
          {stats.byCategory.length === 0 ? (
            <p className="empty-copy">No AI results yet. Process a case to populate category analytics.</p>
          ) : (
            <div className="metric-list">
              {stats.byCategory.map((item) => (
                <div className="metric-row" key={item.key}>
                  <span>{item.key.replaceAll('_', ' ')}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Team routing</h2>
            <span className="panel-kicker">
              {formatListCount(stats.byAssignedTeam.length, 'team', 'teams')}
            </span>
          </div>
          {stats.byAssignedTeam.length === 0 ? (
            <p className="empty-copy">No routed cases yet. Process a case to apply team assignment.</p>
          ) : (
            <div className="metric-list">
              {stats.byAssignedTeam.map((item) => (
                <div className="metric-row" key={item.key}>
                  <span>{formatTeamLabel(item.key)}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Priority mix</h2>
            <span className="panel-kicker">
              {formatListCount(stats.byPriority.length, 'priority', 'priorities')}
            </span>
          </div>
          {stats.byPriority.length === 0 ? (
            <p className="empty-copy">No AI results yet. Priority analytics appear after processing.</p>
          ) : (
            <div className="metric-list">
              {stats.byPriority.map((item) => (
                <div className="metric-row" key={item.key}>
                  <span>{item.key}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Need review</h2>
            <span className="panel-kicker">
              {formatListCount(stats.reviewItems.length, 'case', 'cases')}
            </span>
          </div>
          {stats.reviewItems.length === 0 ? (
            <p className="empty-copy">No items currently need review.</p>
          ) : (
            <div className="review-list">
              {stats.reviewItems.map((item) => (
                <article className="review-list-item" key={item.id}>
                  <div>
                    <p className="row-title">{item.subject}</p>
                    <p className="row-meta">
                      {item.sender} | {formatDateTime(item.receivedAt)} | {formatTeamLabel(item.assignedTeam)}
                    </p>
                  </div>
                  <div className="review-item-actions">
                    <StatusBadge value={item.status} tone={getStatusTone(item.status)} />
                    <Link href={`/emails/${item.id}`} className="ghost-link">
                      Open case
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </AppShell>
  );
}
