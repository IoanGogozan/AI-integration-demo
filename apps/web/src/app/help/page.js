import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { getLocalizationSummary, localizationConfig } from '../../lib/localization';

const usageSteps = [
  'Open Home for the shortest path into the demo and the main navigation.',
  'Use Overview when you want the commercial framing before showing the workflow.',
  'Open Inbox to inspect a case, upload an attachment, and process it with AI.',
  'Use the case detail page to review the AI result, edit fields, and approve or complete the case.',
  'Open Queues to show how routed cases are grouped into Finance, Support, Legal, Sales, and Admin worklists.',
  'Open Results for a fast view of concrete AI outputs across processed cases.',
  'Open Dashboard to show aggregate metrics and the review backlog.'
];

const presenterTips = [
  'Start with a seeded processed case if you need a safe, reliable path for a live demo.',
  'Use the AI process button live only after confirming the API key and backend are configured.',
  'Keep the message focused on business output: route, summary, deadline extraction, and reply draft.',
  'Use Queues after the inbox walkthrough to prove that the case was handed to a concrete team queue.',
  'Use manual review to show that the human stays in control of the final decision.',
  'Keep the attachment claim realistic: text-based files and simple PDFs are strong, OCR-heavy or Office-native automation is not the current promise.'
];

export default function HelpPage() {
  return (
    <AppShell
      eyebrow="Help"
      title="How to use the demo"
      description="A short guide for navigating the application, running the main workflow, and presenting the product clearly."
      actions={
        <Link href="/inbox" className="primary-link">
          Open inbox
        </Link>
      }
    >
      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Core workflow</h2>
            <span className="panel-kicker">Day-to-day use</span>
          </div>
          <div className="help-list">
            {usageSteps.map((step, index) => (
              <article className="help-item" key={step}>
                <span className="showcase-index">{String(index + 1).padStart(2, '0')}</span>
                <p>{step}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Presenter guidance</h2>
            <span className="panel-kicker">Demo-friendly tips</span>
          </div>
          <div className="help-list">
            {presenterTips.map((tip, index) => (
              <article className="help-item" key={tip}>
                <span className="showcase-index">{String(index + 1).padStart(2, '0')}</span>
                <p>{tip}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Quick start</h2>
            <p className="panel-copy">
              Use this path when you need the shortest reliable route through the demo.
            </p>
          </div>
          <Link href="/results" className="ghost-link">
            Start with results
          </Link>
        </div>

        <div className="pill-row">
          <span className="info-pill">1. Home</span>
          <span className="info-pill">2. Results</span>
          <span className="info-pill">3. Inbox case</span>
          <span className="info-pill">4. Queues</span>
          <span className="info-pill">5. Dashboard</span>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Localization readiness</h2>
            <p className="panel-copy">{getLocalizationSummary()}</p>
          </div>
          <span className="panel-kicker">Future-ready setup</span>
        </div>

        <div className="pill-row">
          {localizationConfig.supportedLocales.map((locale) => (
            <span className="info-pill" key={locale.code}>
              {locale.label} · {locale.status.replaceAll('_', ' ')}
            </span>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Navigation map</h2>
            <p className="panel-copy">
              Each page has a distinct role so you can move between story, workflow, and metrics without losing context.
            </p>
          </div>
          <span className="panel-kicker">Page purpose</span>
        </div>

        <div className="quick-link-grid">
          <article className="panel quick-link-card">
            <h2>Home</h2>
            <p className="panel-copy">Starting point with live stats, featured case, and direct links into the rest of the product.</p>
          </article>
          <article className="panel quick-link-card">
            <h2>Overview</h2>
            <p className="panel-copy">Commercial framing and recommended demo cases for a business audience.</p>
          </article>
          <article className="panel quick-link-card">
            <h2>Inbox</h2>
            <p className="panel-copy">Operational list of incoming cases and the main entry into case handling.</p>
          </article>
          <article className="panel quick-link-card">
            <h2>Queues</h2>
            <p className="panel-copy">Team-based operational queues that make the routing and handoff story explicit.</p>
          </article>
          <article className="panel quick-link-card">
            <h2>Results</h2>
            <p className="panel-copy">Processed AI output across cases when you want to show outcomes first.</p>
          </article>
          <article className="panel quick-link-card">
            <h2>Dashboard</h2>
            <p className="panel-copy">Aggregate metrics for categories, priorities, and review workload.</p>
          </article>
        </div>
      </section>
    </AppShell>
  );
}
