'use client';

import Link from 'next/link';
import { FiCopy, FiBarChart2, FiMoreVertical, FiEdit, FiTrash2, FiUsers } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Import Shadcn Card components

interface Project {
  id: string;
  project_name: string;
  project_goal: string;
  prototype_url: string | null;
  interview_link: string | null;
  response_count: number; 
  created_at?: string;
}

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

const DropdownMenu = ({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void; }) => (
  <div className="absolute right-0 mt-2 w-48 origin-top-right bg-card rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
    <div className="py-1">
      <button onClick={onEdit} className="flex items-center w-full text-left px-4 py-2 text-sm text-foreground hover:bg-background">
        <FiEdit className="mr-3 h-5 w-5 text-muted-foreground" /> Edit
      </button>
      <button onClick={onDelete} className="flex items-center w-full text-left px-4 py-2 text-sm text-destructive hover:bg-background">
        <FiTrash2 className="mr-3 h-5 w-5" /> Delete
      </button>
    </div>
  </div>
);

export default function ProjectList({ projects, onEdit, onDelete }: ProjectListProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyLink = (link: string | null) => {
    if (link) {
      navigator.clipboard.writeText(link).then(() => alert('Link copied to clipboard!'));
    }
  };

  if (projects.length === 0) {
    return (
      <Card className="text-center py-20 px-6">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-foreground">No Projects Yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mt-2 text-base text-muted-foreground">Click "New Project" to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="flex flex-col justify-between transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-bold text-foreground pr-4">{project.project_name}</CardTitle>
              <div className="relative" ref={openDropdownId === project.id ? dropdownRef : null}>
                <button onClick={() => setOpenDropdownId(openDropdownId === project.id ? null : project.id)} className="text-muted-foreground hover:text-foreground">
                  <FiMoreVertical />
                </button>
                {openDropdownId === project.id && (
                  <DropdownMenu 
                    onEdit={() => { onEdit(project); setOpenDropdownId(null); }} 
                    onDelete={() => { onDelete(project.id); setOpenDropdownId(null); }} 
                  />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mt-1 text-sm h-10">{project.project_goal}</p>
             <span className="mt-3 inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Active
            </span>
            <div className="flex items-center text-muted-foreground mt-4">
                    <FiUsers className="mr-2"/>
                    <span className="text-sm font-semibold">{project.response_count} Responses</span>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-around bg-slate-50">
             <Link href={`/results/${project.id}`} className="flex items-center text-sm font-semibold text-foreground hover:text-primary">
                <FiBarChart2 className="mr-2" /> Insights
            </Link>
            <button onClick={() => handleCopyLink(project.interview_link)} className="flex items-center text-sm font-semibold text-foreground hover:text-primary">
              <FiCopy className="mr-2" /> Copy Link
            </button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}