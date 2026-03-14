import './globals.css';

export const metadata = {
  title: 'AI Intake Assistant',
  description: 'AI workflow demo for Norwegian SMBs'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
