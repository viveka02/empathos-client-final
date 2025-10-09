'use client';

import { useState, FormEvent } from 'react';

interface CreateProjectFormProps {
  onProjectCreated: () => void;
  setGlobalError: (message: string | null) => void;
  sessionToken: string | null;
}

// Get the API URL from our new environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CreateProjectForm({ onProjectCreated, setGlobalError, sessionToken }: CreateProjectFormProps) {
  const [projectName, setProjectName] = useState('');
  const [projectGoal, setProjectGoal] = useState('');
  const [prototypeUrl, setPrototypeUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!sessionToken) {
      setGlobalError("Authentication error. Please log in again.");
      return;
    }
    setIsSubmitting(true);
    setGlobalError(null);

    const newProjectData = { projectName, projectGoal, prototypeUrl };

    try {
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
      
      setProjectName('');
      setProjectGoal('');
      setPrototypeUrl('');
      onProjectCreated();

    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-12 p-6 bg-white border rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Create New Project</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">Project Name</label>
          <input id="projectName" type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
        <div>
          <label htmlFor="projectGoal" className="block text-sm font-medium text-gray-700">Project Goal</label>
          <textarea id="projectGoal" value={projectGoal} onChange={(e) => setProjectGoal(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" rows={3}/>
        </div>
        <div>
          <label htmlFor="prototypeUrl" className="block text-sm font-medium text-gray-700">Prototype URL</label>
          <input id="prototypeUrl" type="url" value={prototypeUrl} onChange={(e) => setPrototypeUrl(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
          {isSubmitting ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>
  );
}