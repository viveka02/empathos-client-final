import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-24 sm:py-32">
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
        Unlock Actionable User Insights, Instantly.
      </h1>
      <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl">
        Empathos is the AI-powered platform that automates user interviews and analysis, helping you build products your users truly need, faster than ever before.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Link href="/auth">
          <Button size="lg">Request Access</Button>
        </Link>
      </div>
    </div>
  );
}