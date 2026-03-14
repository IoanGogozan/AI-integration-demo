'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from './logout-button';

const primaryNavItems = [
  { href: '/inbox', label: 'Inbox' },
  { href: '/queues', label: 'Queues' },
  { href: '/dashboard', label: 'Dashboard' }
];

const supportNavItems = [
  { href: '/', label: 'Home' },
  { href: '/results', label: 'Results' },
  { href: '/overview', label: 'Overview' },
  { href: '/help', label: 'Help' }
];

export function PrimaryNav({ session }) {
  const pathname = usePathname();
  const isSupportActive = supportNavItems.some(
    (item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
  );

  return (
    <nav className="primary-nav" aria-label="Primary">
      <Link href="/" className="brand-mark">
        Norvix AI Demo
      </Link>

      <div className="nav-main-links">
        {primaryNavItems.map((item) => {
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
      </div>

      <div className="nav-side">
        <details className="nav-menu">
          <summary className={isSupportActive ? 'nav-link nav-link-active' : 'nav-link'}>
            More
          </summary>
          <div className="nav-menu-panel">
            {supportNavItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isActive ? 'nav-menu-link nav-menu-link-active' : 'nav-menu-link'}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </details>
        <span className="nav-user-pill">{session.name}</span>
        <LogoutButton />
      </div>
    </nav>
  );
}
