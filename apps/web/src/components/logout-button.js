'use client';

import { useState, useTransition } from 'react';

export function LogoutButton() {
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState('info');
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    setMessage('');
    setMessageTone('info');

    startTransition(async () => {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });

        window.location.href = '/login';
      } catch (error) {
        console.error(error);
        setMessage('Logout failed.');
        setMessageTone('error');
      }
    });
  }

  return (
    <div className="logout-wrap">
      <button className="ghost-link action-button" disabled={isPending} onClick={handleLogout} type="button">
        {isPending ? 'Signing out...' : 'Sign out'}
      </button>
      {message ? <p className={`feedback-message feedback-${messageTone}`}>{message}</p> : null}
    </div>
  );
}
