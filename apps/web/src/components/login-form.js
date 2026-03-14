'use client';

import { useState, useTransition } from 'react';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  'http://localhost:4000';

export function LoginForm() {
  const [email, setEmail] = useState('demo@norvix.ai');
  const [password, setPassword] = useState('demo1234');
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState('info');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setMessageTone('info');

    startTransition(async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            email,
            password
          })
        });

        if (!response.ok) {
          throw new Error('Login failed');
        }

        window.location.href = '/';
      } catch (error) {
        console.error(error);
        setMessage('Login failed. Check the demo credentials and try again.');
        setMessageTone('error');
      }
    });
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label className="review-field">
        <span>Email</span>
        <input
          className="text-input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label className="review-field">
        <span>Password</span>
        <input
          className="text-input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      <button className="primary-link action-button" disabled={isPending} type="submit">
        {isPending ? 'Signing in...' : 'Sign in'}
      </button>

      {message ? <p className={`feedback-message feedback-${messageTone}`}>{message}</p> : null}
    </form>
  );
}
