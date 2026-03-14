'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from './logout-button';
import { formatRoleLabel } from '../lib/permissions';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/overview', label: 'Overview' },
  { href: '/inbox', label: 'Inbox' },
  { href: '/queues', label: 'Queues' },
  { href: '/results', label: 'Results' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/help', label: 'Help' }
];

export function PrimaryNav({ session }) {
  const pathname = usePathname();

  return (
    <nav className="primary-nav" aria-label="Primary">
      <Link href="/" className="brand-mark">
        Norvix AI Demo
      </Link>

      <div className="nav-links">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? 'nav-link nav-link-active' : 'nav-link'}
            >
              {item.label}
            </Link>
          );
        })}
        <span className="nav-user">{session.name}</span>
        <span className="role-pill">{formatRoleLabel(session.role)}</span>
        <LogoutButton />
      </div>
    </nav>
  );
}
