'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

// 1. Get the API URL from our environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function NewProjectPage() {
  const [projectName, setProjectName] = useState('');
  const [projectGoal, setProjectGoal] = useState('');
  const [prototypeUrl, setPrototypeUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/auth');
        } else {
            setSessionToken(session.access_token);
        }
    };
    getSession();
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!sessionToken) {
      setError("Authentication error. Please log in again.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    const newProjectData = { projectName, projectGoal, prototypeUrl };

    try {
      // 2. Use the correct API_URL in the fetch call
      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(newProjectData),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      router.push('/');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/dashboard" className="text-sm text-accent hover:underline mb-6 inline-block">&larr; Back to Projects</Link>
        <div className="p-8 bg-card border border-border rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-foreground">Create a New Project</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="projectName" className="block text-sm font-medium text-muted-foreground">Project Name</label>
                    <input id="projectName" type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"/>
                </div>
                <div>
                    <label htmlFor="projectGoal" className="block text-sm font-medium text-muted-foreground">Project Goal</label>
                    <textarea id="projectGoal" value={projectGoal} onChange={(e) => setProjectGoal(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring" rows={4}/>
                </div>
                <div>
                    <label htmlFor="prototypeUrl" className="block text-sm font-medium text-muted-foreground">Prototype URL</label>
                    <input id="prototypeUrl" type="url" value={prototypeUrl} onChange={(e) => setPrototypeUrl(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"/>
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <button type="submit" disabled={isSubmitting} className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:bg-primary/90 disabled:opacity-50 transition-colors duration-200">
                    {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
            </form>
        </div>
    </div>
  );
}