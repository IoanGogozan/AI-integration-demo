import Link from 'next/link';
import { AppShell } from '../../components/app-shell';

const testingSteps = [
  'Open Inbox.',
  'Choose a case.',
  'Open the case and click Process with AI.',
  'Review the category, priority, route, summary, evidence, and reply draft.',
  'Open Queues to see which team should handle the case next.',
  'Change status or assignment if you want to simulate human review.'
];

const expectedResults = [
  'The app reads the email and any extracted attachment text.',
  'The AI suggests a category, priority, summary, route, and reply draft.',
  'The result is saved in a workflow record with team assignment and audit history.',
  'Queues shows which team should handle the case next.'
];

const scopeNotes = [
  'Best for text-based attachments, simple PDFs, and structured intake documents.',
  'Includes AI fallback behavior if no API key is configured or structured output is invalid.',
  'Not positioned yet as OCR-heavy image processing or full Office document automation.'
];

export default function HelpPage() {
  return (
    <AppShell
      eyebrow="Help"
      title="How to test this demo"
      description="Open a case, run AI, review the result, and see which team should handle it next."
      actions={
        <Link href="/inbox" className="primary-link">
          Open inbox
        </Link>
      }
    >
      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>What this demo does</h2>
            <span className="panel-kicker">In simple terms</span>
          </div>
          <div className="help-list">
            {expectedResults.map((item, index) => (
              <article className="help-item" key={item}>
                <span className="showcase-index">{String(index + 1).padStart(2, '0')}</span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>How to test it</h2>
            <span className="panel-kicker">Fast path</span>
          </div>
          <div className="help-list">
            {testingSteps.map((step, index) => (
              <article className="help-item" key={step}>
                <span className="showcase-index">{String(index + 1).padStart(2, '0')}</span>
                <p>{step}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>What this demo is meant to show</h2>
            <p className="panel-copy">
              Faster case handling, less manual work, better routing, and human review before final action.
            </p>
          </div>
          <Link href="/queues" className="ghost-link">
            Open queues
          </Link>
        </div>

        <div className="pill-row">
          <span className="info-pill">Less manual work</span>
          <span className="info-pill">Better routing</span>
          <span className="info-pill">Human review</span>
          <span className="info-pill">Workflow record</span>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>What it does not do yet</h2>
            <p className="panel-copy">
              Keep the scope realistic when you show the demo.
            </p>
          </div>
          <span className="panel-kicker">Current scope</span>
        </div>

        <div className="help-list">
          {scopeNotes.map((item, index) => (
            <article className="help-item" key={item}>
              <span className="showcase-index">{String(index + 1).padStart(2, '0')}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
