'use client';

import { FiCpu } from 'react-icons/fi';

interface ConsentScreenProps {
  onConsent: () => void; // A function to call when the user agrees
}

export function ConsentScreen({ onConsent }: ConsentScreenProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-2xl p-8 bg-card border border-border rounded-lg shadow-md text-center">
        <FiCpu className="mx-auto h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold mt-4 text-foreground">
          AI-Powered User Interview
        </h1>
        <div className="mt-6 text-left text-muted-foreground space-y-4">
          <p>Welcome! You're about to participate in an automated user research session conducted by an AI.</p>
          <ul className="list-disc list-inside space-y-2">
            <li>The session will be recorded for analysis by the research team.</li>
            <li>There are no right or wrong answers; we are interested in your honest feedback.</li>
            <li>The AI is designed to guide the conversation but please speak freely.</li>
          </ul>
          <p>By clicking the button below, you consent to the recording and use of this session for product research purposes.</p>
        </div>
        <button
          onClick={onConsent}
          className="mt-8 w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:bg-primary/90"
        >
          Agree and Start Session
        </button>
      </div>
    </main>
  );
}