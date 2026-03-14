'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  'http://localhost:4000';

export function BusinessActionsPanel({ emailId, assignedQueue, canAct }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState('info');
  const [isPending, startTransition] = useTransition();

  async function runAction(actionType) {
    setMessage('');
    setMessageTone('info');

    try {
      const response = await fetch(`${apiBaseUrl}/emails/${emailId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          actionType,
          targetQueue: assignedQueue
        })
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || 'Workflow action failed');
      }

      setMessage(
        actionType === 'create_internal_task'
          ? 'Internal task created and saved to the workflow record.'
          : 'Queue handoff recorded in the workflow record.'
      );
      setMessageTone('success');
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Workflow action failed.');
      setMessageTone('error');
    }
  }

  if (!canAct) {
    return (
      <p className="empty-copy">
        Your role can inspect workflow actions, but only operator, reviewer, or admin accounts can trigger them.
      </p>
    );
  }

  return (
    <div>
      <p className="panel-copy compact-copy">
        These actions simulate the next operational step and store it in the workflow history.
      </p>
      <div className="review-actions">
        <button
          className="primary-link action-button"
          disabled={isPending}
          onClick={() => runAction('create_internal_task')}
          type="button"
        >
          Create internal task
        </button>
        <button
          className="ghost-link action-button"
          disabled={isPending}
          onClick={() => runAction('send_to_queue')}
          type="button"
        >
          Send to queue
        </button>
      </div>
      {message ? <p className={`feedback-message feedback-${messageTone}`}>{message}</p> : null}
    </div>
  );
}
