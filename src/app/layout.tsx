import type { Metadata } from 'next';
import './globals.css';
import { siteConfig } from '@/site.config';

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="core-zone">
          <main style={{ paddingTop: '40px' }}>
            {children}
          </main>
          
          <footer className="terminal-padding" style={{ paddingTop: '64px' }}>
            <hr />
            <p className="dimmed" style={{ fontSize: '14px' }}>{siteConfig.footerText}</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
