'use client';

import { useState, FormEvent } from 'react';

interface Project {
  id: string;
  project_name: string;
  project_goal: string;
  prototype_url: string | null;
  interview_link: string | null;
  response_count: number;
}

interface EditModalProps {
  project: Project;
  onSave: (updatedProject: Project) => void;
  onClose: () => void;
  sessionToken: string | null;
}

// Get the API URL from our new environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditProjectModal({ project, onSave, onClose, sessionToken }: EditModalProps) {
  const [projectName, setProjectName] = useState(project.project_name);
  const [projectGoal, setProjectGoal] = useState(project.project_goal);
  const [prototypeUrl, setPrototypeUrl] = useState(project.prototype_url || '');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!sessionToken) {
      console.error("Authentication error. Please log in again.");
      return;
    }

    const updatedData = { projectName, projectGoal, prototypeUrl };

    try {
      const response = await fetch(`${API_URL}/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const savedProject: Project = await response.json();
      onSave(savedProject);
      onClose();

    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="editProjectName" className="block text-sm font-medium text-gray-700">Project Name</label>
            <input id="editProjectName" type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div>
            <label htmlFor="editProjectGoal" className="block text-sm font-medium text-gray-700">Project Goal</label>
            <textarea id="editProjectGoal" value={projectGoal} onChange={(e) => setProjectGoal(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" rows={3}/>
          </div>
          <div>
            <label htmlFor="editPrototypeUrl" className="block text-sm font-medium text-gray-700">Prototype URL</label>
            <input id="editPrototypeUrl" type="url" value={prototypeUrl} onChange={(e) => setPrototypeUrl(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}