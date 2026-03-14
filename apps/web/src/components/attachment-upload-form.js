'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  'http://localhost:4000';

export function AttachmentUploadForm({ emailId }) {
  const formRef = useRef(null);
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(`${apiBaseUrl}/emails/${emailId}/attachments`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      formRef.current?.reset();
      setMessage('Attachment uploaded and processed.');
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      setMessage('Upload failed. Verify the API is running and try again.');
    }
  }

  return (
    <form ref={formRef} className="upload-form" onSubmit={handleSubmit}>
      <label className="upload-label" htmlFor="attachment">
        Upload a text file or simple PDF
      </label>
      <input
        id="attachment"
        name="attachment"
        type="file"
        accept=".txt,.md,.csv,.json,.pdf,text/plain,text/markdown,text/csv,application/json,application/pdf"
        required
      />
      <button className="primary-link upload-button" disabled={isPending} type="submit">
        {isPending ? 'Uploading...' : 'Upload attachment'}
      </button>
      {message ? <p className="upload-message">{message}</p> : null}
    </form>
  );
}
