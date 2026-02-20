import './globals.css';
import { Inter } from 'next/font/google';
import { ActiveLink } from '@/components/Navbar';
import { Toaster } from '@/components/ui/sonner';
import { Instagram, Mail } from 'lucide-react';

const inter = Inter({ weight: ['300', '400', '500', '600', '700'], subsets: ['latin'] });

const TITLE = 'Aria GPT';
const DESCRIPTION = 'AI beauty assistant powered by LangGraph multi-agent pipeline.';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{TITLE}</title>
        <link rel="shortcut icon" type="image/svg+xml" href="/images/favicon.png" />
        <meta name="description" content={DESCRIPTION} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <div className="bg-background grid grid-rows-[auto,1fr] h-[100dvh]">
          {/* Navigation */}
          <nav className="bg-background/80 backdrop-blur-xl border-b border-border/50 z-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <span
                  className="text-2xl tracking-wide text-gradient"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Aria
                </span>

                {/* Nav Links */}
                <nav className="flex gap-1">
                  <ActiveLink href="/">Chat</ActiveLink>
                </nav>

                {/* Social Icons */}
                <div className="flex items-center gap-1">
                  <a
                    href="https://instagram.com/ariakatebzada"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    <Instagram size={18} />
                  </a>
                  <a
                    href="mailto:contact@aria.com"
                    className="p-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    <Mail size={18} />
                  </a>
                </div>
              </div>
            </div>
          </nav>

          {/* Content */}
          <div className="relative grid overflow-hidden">
            <div className="absolute inset-0">{children}</div>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
