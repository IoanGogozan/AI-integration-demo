'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  'http://localhost:4000';

export function ProcessCaseButton({ emailId, disabled = false, disabledMessage = '' }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState('info');
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    setMessage('');
    setMessageTone('info');

    try {
      const response = await fetch(`${apiBaseUrl}/emails/${emailId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.message || 'Processing failed');
      }

      setMessage('Case processed and saved.');
      setMessageTone('success');
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Processing failed. Verify the API is running and try again.');
      setMessageTone('error');
    }
  }

  return (
    <div className="process-action">
      <button
        className="primary-link action-button"
        disabled={disabled || isPending}
        onClick={handleClick}
        type="button"
      >
        {isPending ? 'Processing...' : 'Process with AI'}
      </button>
      {disabled && disabledMessage ? (
        <p className="feedback-message feedback-info">{disabledMessage}</p>
      ) : null}
      {message ? <p className={`feedback-message feedback-${messageTone}`}>{message}</p> : null}
    </div>
  );
}
