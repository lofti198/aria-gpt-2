import './globals.css';
import { Roboto_Mono, Inter } from 'next/font/google';
import { ActiveLink } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Github, LogOut } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import Image from 'next/image';
import { auth0 } from '../../library/auth0';

const robotoMono = Roboto_Mono({ weight: '400', subsets: ['latin'] });
const publicSans = Inter({ weight: '400', subsets: ['latin'] });

const TITLE = 'Auth0 Assistant0: An Auth0 + LangChain + Next.js Template';
const DESCRIPTION = 'Starter template showing how to use Auth0 in LangChain + Next.js projects.';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let session = null;
  try {
    session = await auth0.getSession();
  } catch {
    // Stale/invalid session cookie — treat as logged out
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{TITLE}</title>
        <link rel="shortcut icon" type="image/svg+xml" href="/images/favicon.png" />
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content="/images/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content="/images/og-image.png" />
      </head>
      <body className={publicSans.className}>
        <div className="bg-secondary grid grid-rows-[auto,1fr] h-[100dvh]">
          <div className="grid grid-cols-[1fr,auto] gap-2 p-4 bg-black/25">
            <div className="flex gap-4 flex-col md:flex-row md:items-center">
              <span className={`${robotoMono.className} text-white text-2xl`}>Aria GPT</span>
              <nav className="flex gap-1 flex-col md:flex-row">
                <ActiveLink href="/">Chat</ActiveLink>
                {/* <ActiveLink href="/act">Interact //TODO</ActiveLink> */}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {session && (
                <>
                  <span className="text-white text-sm">{session.user.name}</span>
                  <Button asChild variant="header" size="default">
                    <a href="/auth/logout">
                      <LogOut className="size-3" />
                      <span>Log out</span>
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="gradient-up bg-gradient-to-b from-white/10 to-white/0 relative grid border-input border-b-0">
            <div className="absolute inset-0">{children}</div>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
