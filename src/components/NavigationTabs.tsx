'use client';

interface NavigationTabsProps {
  // In the future, we can add a prop to highlight the active tab
}

export function NavigationTabs({}: NavigationTabsProps) {
  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'charts', label: 'Charts' },
    { id: 'suggestions', label: 'AI Suggestions' },
    { id: 'insights', label: 'Recent Insights' },
  ];

  return (
    <nav className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-10 mb-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex space-x-8">
          {sections.map((section) => (
            <a 
              key={section.id} 
              href={`#${section.id}`}
              className="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-muted-foreground hover:border-muted hover:text-foreground"
            >
              {section.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}