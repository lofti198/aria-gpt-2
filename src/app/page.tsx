import { ChatWindow } from '@/components/ChatWindow';
import { GuideInfoBox } from '@/components/guide/GuideInfoBox';
// AUTH DISABLED — imports below unused while auth is off
// import { Button } from '@/components/ui/button';
// import { LogIn, UserPlus } from 'lucide-react';
// import { auth0 } from '../../library/auth0';

export default async function Home() {
  // AUTH DISABLED — skip session check and always show chat
  // To re-enable, uncomment the block below and the imports above
  /*
  let session = null;
  try {
    session = await auth0.getSession();
  } catch {
    // Stale/invalid session cookie — treat as logged out
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <p className="text-white text-xl">You&apos;re not logged in</p>
        <div className="flex gap-4">
          <Button asChild variant="default" size="lg">
            <a href="/auth/login">
              <LogIn className="size-4 mr-2" />
              Log in
            </a>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <a href="/auth/login?screen_hint=signup">
              <UserPlus className="size-4 mr-2" />
              Sign up
            </a>
          </Button>
        </div>
      </div>
    );
  }
  */

  const InfoCard = (
    <GuideInfoBox>
     Beauty assistant
    </GuideInfoBox>
  );
  return (
    <ChatWindow
      endpoint="api/chat"
      emoji="🤖"
      placeholder="I'm your personal assistant. How can I help you today?"
      emptyStateComponent={InfoCard}
      presetQuestions={[
        'Как наращивать ресницы? Какие тренды в нейлинге сейчас?',
      ]}
    />
  );
}
