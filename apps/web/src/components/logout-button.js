'use client';

import { useState, useTransition } from 'react';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  'http://localhost:4000';

export function LogoutButton() {
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    setMessage('');

    startTransition(async () => {
      try {
        await fetch(`${apiBaseUrl}/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });

        window.location.href = '/login';
      } catch (error) {
        console.error(error);
        setMessage('Logout failed.');
      }
    });
  }

  return (
    <div className="logout-wrap">
      <button className="ghost-link action-button" disabled={isPending} onClick={handleLogout} type="button">
        {isPending ? 'Signing out...' : 'Sign out'}
      </button>
      {message ? <p className="nav-feedback">{message}</p> : null}
    </div>
  );
}
