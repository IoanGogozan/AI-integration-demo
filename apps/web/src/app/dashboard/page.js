import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { StatusBadge } from '../../components/status-badge';
import { getDashboardStats } from '../../lib/api';
import { formatDateTime, formatListCount } from '../../lib/formatters';

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

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <AppShell
      eyebrow="Phase 6: Dashboard"
      title="Workflow dashboard"
      description="A compact operations view for demo metrics, AI processing output, and cases that still need attention."
      actions={
        <Link href="/" className="primary-link">
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
                    <p className="row-meta">{item.sender} | {formatDateTime(item.receivedAt)}</p>
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
