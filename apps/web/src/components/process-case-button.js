'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  'http://localhost:4000';

export function ProcessCaseButton({ emailId }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    setMessage('');

    try {
      const response = await fetch(`${apiBaseUrl}/emails/${emailId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Processing failed');
      }

      setMessage('Case processed and saved.');
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      setMessage('Processing failed. Verify the API is running and try again.');
    }
  }

  return (
    <div className="process-action">
      <button className="primary-link action-button" disabled={isPending} onClick={handleClick} type="button">
        {isPending ? 'Processing...' : 'Process with AI'}
      </button>
      {message ? <p className="upload-message">{message}</p> : null}
    </div>
  );
}
