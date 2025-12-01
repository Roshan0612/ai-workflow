import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'AI Workflow Assistant',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="page-root">
          <header className="site-header">
            <div className="brand">AI Workflow Assistant</div>
            <div className="tag">Summarize text and generate action items</div>
          </header>

          <main className="container">{children}</main>

          <footer className="site-footer">Made with LangGraph • Gemini</footer>
        </div>
      </body>
    </html>
  );
}
