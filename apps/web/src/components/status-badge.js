import { formatStatus } from '../lib/formatters';

export function StatusBadge({ value, tone = 'neutral' }) {
  return (
    <span className={`status-badge status-${tone}`}>
      {formatStatus(value)}
    </span>
  );
}
