'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatComponent from '@/components/ChatComponent';
import { ConsentScreen } from '@/components/ConsentScreen'; // Make sure this import is correct

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Project {
  id: string;
  project_name: string;
  project_goal: string;
  prototype_url: string | null;
  prototype_type: 'image' | 'url' | null; // Added prototype_type
}

export default function InterviewPage() {
  const params = useParams();
  const projectId = params.projectId as string;
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
    }
  }, [projectId]);

  if (loading) return <p className="text-center mt-24">Loading Session...</p>;
  if (error) return <p className="text-center mt-24 text-red-500">Error: {error}</p>;
  if (!project) return <p className="text-center mt-24">Project not found.</p>;

  if (!hasConsented) {
    return <ConsentScreen onConsent={() => setHasConsented(true)} />;
  }

  const renderPrototype = () => {
    if (!project.prototype_url) {
      return (
        <div className="flex justify-center items-center h-full">
          <p className="text-muted-foreground">No prototype provided for this project.</p>
        </div>
      );
    }

    if (project.prototype_type === 'image') {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={project.prototype_url} alt="Prototype" className="w-full h-full object-contain bg-gray-100" />
      );
    } else { // Default to URL if type is 'url' or not specified
      return (
        <iframe src={project.prototype_url} className="w-full h-full" title="Prototype" sandbox="allow-scripts allow-same-origin allow-popups"/>
      );
    }
  };

  return (
    <main className="flex h-screen overflow-hidden">
      <div className="w-1/3 bg-gray-50 p-8 flex flex-col border-r border-gray-200">
        <h1 className="text-2xl font-bold text-foreground">Research Session</h1>
        <h2 className="text-xl text-muted-foreground mb-4">for "{project.project_name}"</h2>
        <div className="mt-4 flex-1 min-h-0 overflow-hidden">
          <ChatComponent 
            projectGoal={project.project_goal} 
            projectId={project.id}
          />
        </div>
      </div>
      <div className="w-2/3">
        {renderPrototype()}
      </div>
    </main>
  );
}