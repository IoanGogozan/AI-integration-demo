import Link from 'next/link';
import { AppShell } from '../components/app-shell';

export default function NotFoundPage() {
  return (
    <AppShell
      eyebrow="Not found"
      title="Case not found"
      description="The requested email case does not exist or is not available from the API."
      actions={
        <Link href="/" className="primary-link">
          Return to inbox
        </Link>
      }
    >
      <section className="panel">
        <p className="empty-copy">
          Verify that the backend is running and that the demo database has been seeded.
        </p>
      </section>
    </AppShell>
  );
}
