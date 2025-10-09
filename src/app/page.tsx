'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import EditProjectModal from '@/components/EditProjectModal';
import ProjectList from '@/components/ProjectList';
import { FiPlus } from 'react-icons/fi';

interface Project {
  id: string;
  project_name: string;
  project_goal: string;
  prototype_url: string | null;
  interview_link: string | null;
  response_count: number;
  created_at?: string;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const router = useRouter();

  const fetchProjects = async (token: string) => {
    try {
      setError(null); 
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Data could not be fetched!');
      const data: Project[] = await response.json();
      setProjects(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
      } else {
        setSessionToken(session.access_token);
        fetchProjects(session.access_token);
      }
    };
    checkSession();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    if (!sessionToken) { setError("Authentication error."); return; }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionToken}` },
      });
      if (!response.ok) throw new Error('Failed to delete project');
      setProjects(projects.filter((project) => project.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSave = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    if (sessionToken) {
      fetchProjects(sessionToken);
    }
  };

  if (loading) return <p className="text-center mt-24">Loading...</p>;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage and track all your projects in one place</p>
        </div>
        <Link href="/projects/new" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:opacity-90">
          <FiPlus className="-ml-1 mr-2 h-5 w-5" />
          New Project
        </Link>
      </div>
      
      {error && <p className="text-center text-destructive mb-4">{`Error: ${error}`}</p>}

      <ProjectList 
        projects={projects}
        onEdit={setEditingProject}
        onDelete={handleDelete}
      />

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onSave={handleSave}
          onClose={() => setEditingProject(null)}
          sessionToken={sessionToken}
        />
      )}
    </main>
  );
}