'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  'http://localhost:4000';

export function ReviewPanel({ emailId, aiResult, currentStatus }) {
  const router = useRouter();
  const [summary, setSummary] = useState(aiResult.summary);
  const [suggestedNextAction, setSuggestedNextAction] = useState(aiResult.suggestedNextAction);
  const [suggestedReply, setSuggestedReply] = useState(aiResult.suggestedReply);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  async function updateReview() {
    setMessage('');

    try {
      const response = await fetch(`${apiBaseUrl}/emails/${emailId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          summary,
          suggestedNextAction,
          suggestedReply
        })
      });

      if (!response.ok) {
        throw new Error('Review update failed');
      }

      setMessage('Review fields saved.');
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      setMessage('Review update failed.');
    }
  }

  async function updateStatus(status, actionLabel) {
    setMessage('');

    try {
      const response = await fetch(`${apiBaseUrl}/emails/${emailId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          status
        })
      });

      if (!response.ok) {
        throw new Error(`${actionLabel} failed`);
      }

      setMessage(`Case marked as ${status.replaceAll('_', ' ')}.`);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      setMessage(`${actionLabel} failed.`);
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Manual review</h2>
          <p className="panel-copy">
            Edit the AI output before approving or routing the case forward.
          </p>
        </div>
        <span className="panel-kicker">Current status: {currentStatus.replaceAll('_', ' ')}</span>
      </div>

      <div className="review-form">
        <label className="review-field">
          <span>Summary</span>
          <textarea rows="4" value={summary} onChange={(event) => setSummary(event.target.value)} />
        </label>

        <label className="review-field">
          <span>Next action</span>
          <textarea
            rows="3"
            value={suggestedNextAction}
            onChange={(event) => setSuggestedNextAction(event.target.value)}
          />
        </label>

        <label className="review-field">
          <span>Reply draft</span>
          <textarea
            rows="6"
            value={suggestedReply}
            onChange={(event) => setSuggestedReply(event.target.value)}
          />
        </label>
      </div>

      <div className="review-actions">
        <button className="primary-link action-button" disabled={isPending} onClick={updateReview} type="button">
          Save review
        </button>
        <button
          className="ghost-link action-button"
          disabled={isPending}
          onClick={() => updateStatus('approved', 'Approve')}
          type="button"
        >
          Approve
        </button>
        <button
          className="ghost-link action-button"
          disabled={isPending}
          onClick={() => updateStatus('needs_review', 'Send to review')}
          type="button"
        >
          Mark needs review
        </button>
        <button
          className="ghost-link action-button"
          disabled={isPending}
          onClick={() => updateStatus('completed', 'Complete')}
          type="button"
        >
          Mark completed
        </button>
      </div>

      {message ? <p className="upload-message">{message}</p> : null}
    </section>
  );
}
