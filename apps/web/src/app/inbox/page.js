import { InboxPageContent } from '../../components/inbox-page-content';

export const dynamic = 'force-dynamic';

export default async function InboxPage({ searchParams }) {
  const params = await searchParams;

  return <InboxPageContent selectedTeam={params.team} />;
}
