import './globals.css';
import { Roboto_Mono, Inter } from 'next/font/google';
import { ActiveLink } from '@/components/Navbar';
// AUTH DISABLED — Button, LogOut, Image unused while auth is off
import { Toaster } from '@/components/ui/sonner';
// import { auth0 } from '../../library/auth0'; // AUTH DISABLED

const robotoMono = Roboto_Mono({ weight: '400', subsets: ['latin'] });
const publicSans = Inter({ weight: '400', subsets: ['latin'] });

const TITLE = 'Aria GPT';
const DESCRIPTION = 'AI assistant powered by LangGraph multi-agent pipeline.';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // AUTH DISABLED — no session check, navbar has no login/logout
  // To re-enable: uncomment auth0 import above and restore session block
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{TITLE}</title>
        <link rel="shortcut icon" type="image/svg+xml" href="/images/favicon.png" />
        <meta name="description" content={DESCRIPTION} />
      </head>
      <body className={publicSans.className}>
        <div className="bg-secondary grid grid-rows-[auto,1fr] h-[100dvh]">
          <div className="grid grid-cols-[1fr,auto] gap-2 p-4 bg-black/25">
            <div className="flex gap-4 flex-col md:flex-row md:items-center">
              <span className={`${robotoMono.className} text-white text-2xl`}>Aria GPT</span>
              <nav className="flex gap-1 flex-col md:flex-row">
                <ActiveLink href="/">Chat</ActiveLink>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {/* AUTH DISABLED — login/logout buttons hidden */}
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
