'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { formatTeamLabel } from '../lib/formatters';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  'http://localhost:4000';

const teamOptions = ['admin', 'finance', 'legal', 'sales', 'support'];

export function AssignmentPanel({ emailId, assignedTeam }) {
  const router = useRouter();
  const [nextTeam, setNextTeam] = useState(assignedTeam || 'admin');
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState('info');
  const [isPending, startTransition] = useTransition();

  async function updateAssignment() {
    setMessage('');
    setMessageTone('info');

    try {
      const response = await fetch(`${apiBaseUrl}/emails/${emailId}/assignment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          assignedTeam: nextTeam
        })
      });

      if (!response.ok) {
        throw new Error('Assignment update failed');
      }

      setMessage(`Case assigned to ${formatTeamLabel(nextTeam)}.`);
      setMessageTone('success');
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      setMessage('Assignment update failed.');
      setMessageTone('error');
    }
  }

  return (
    <div className="assignment-panel">
      <label className="review-field">
        <span>Assigned team</span>
        <select
          className="text-input"
          disabled={isPending}
          onChange={(event) => setNextTeam(event.target.value)}
          value={nextTeam}
        >
          {teamOptions.map((team) => (
            <option key={team} value={team}>
              {formatTeamLabel(team)}
            </option>
          ))}
        </select>
      </label>

      <button className="ghost-link action-button" disabled={isPending} onClick={updateAssignment} type="button">
        {isPending ? 'Saving...' : 'Update assignment'}
      </button>

      {message ? <p className={`feedback-message feedback-${messageTone}`}>{message}</p> : null}
    </div>
  );
}
