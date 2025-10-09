// client/src/app/components/Transcript.tsx
'use client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function Transcript({ transcript }: { transcript: Message[] }) {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Full Transcript</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-4 border p-4 rounded-md bg-background">
          {transcript.map((msg, msgIndex) => (
            <div key={msgIndex} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-lg px-4 py-3 rounded-lg shadow-sm ${
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}