'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatComponent from '@/components/ChatComponent';
import { ConsentScreen } from '@/components/ConsentScreen';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Project {
  id: string;
  project_name: string;
  project_goal: string;
  prototype_url: string | null;
}

export default function InterviewPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter(); // Keep router for potential future use

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    if (projectId) {
      const fetchProjectDetails = async () => {
        try {
          const response = await fetch(`${API_URL}/interview/${projectId}`);
          if (!response.ok) throw new Error('Project not found or error fetching data.');
          const data: Project = await response.json();
          setProject(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchProjectDetails();
    } else {
        setLoading(false);
        setError("No project ID found in the URL.");
    }
  }, [projectId]);

  if (loading) return <p className="text-center mt-24">Loading Session...</p>;
  if (error) return <p className="text-center mt-24 text-destructive">Error: {error}</p>;
  if (!project) return <p className="text-center mt-24">Project not found.</p>;

  if (!hasConsented) {
    return <ConsentScreen onConsent={() => setHasConsented(true)} />;
  }

  return (
    <main className="flex h-screen bg-background">
      <div className="w-1/3 bg-slate-50 p-6 flex flex-col border-r border-border">
        <h1 className="text-2xl font-bold text-foreground">Research Session</h1>
        <h2 className="text-xl text-muted-foreground mb-4">for &quot;{project.project_name}&quot;</h2>
        <div className="mt-4 flex-1 min-h-0">
          <ChatComponent 
            projectGoal={project.project_goal} 
            projectId={project.id}
          />
        </div>
      </div>
      <div className="w-2/3">
        {project.prototype_url ? (
          <iframe 
            src={project.prototype_url} 
            className="w-full h-full" 
            title="Prototype"
          />
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-muted-foreground">No prototype provided for this project.</p>
          </div>
        )}
      </div>
    </main>
  );
}