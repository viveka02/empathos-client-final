'use client';
        
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { FiCpu } from 'react-icons/fi';
import { StatsCards } from '@/components/StatsCards';
import { InsightsCharts } from '@/components/InsightsCharts';
import { Badge } from '@/components/Badge';
import { ThematicAnalysisDisplay } from '@/components/ThematicAnalysisDisplay';
import { NavigationTabs } from '@/components/NavigationTabs';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
// Create a simple wrapper for the icon to satisfy TypeScript
const CpuIcon = () => <FiCpu className="mr-2 h-5 w-5"/>;

// --- INTERFACES ---
interface Message {
  role: 'user' | 'assistant';
  content: string;
}
interface Interview {
  id: string;
  project_id: string;
  transcript: Message[];
  created_at: string;
}
interface Insight {
  id: string;
  insight_text: string;
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  priority: 'High' | 'Medium' | 'Low';
}
interface ChartData {
  name: string;
  value: number;
}

export default function ResultsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thematicAnalysis, setThematicAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<ChartData[]>([]);
  const [sentimentCounts, setSentimentCounts] = useState<ChartData[]>([]);

  // This is the corrected useEffect hook
  useEffect(() => {
    const fetchAllData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);

        const token = session.access_token;
        const [interviewsRes, insightsRes, categoryRes, sentimentRes] = await Promise.all([
          fetch(`${API_URL}/interviews/${projectId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/insights/${projectId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/insights/${projectId}/category-counts`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/insights/${projectId}/sentiment-counts`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!interviewsRes.ok || !insightsRes.ok || !categoryRes.ok || !sentimentRes.ok) {
          throw new Error("Failed to fetch all necessary data.");
        }

        const interviewsData = await interviewsRes.json();
        const insightsData = await insightsRes.json();
        const categoryData = await categoryRes.json();
        const sentimentData = await sentimentRes.json();

        // --- THIS IS THE FIX ---
        const sentimentColorMap: { [key: string]: string } = {
        positive: '#198754', // Green
        negative: '#DC3545', // Red
        neutral: '#6C757D',  // Muted Grey
        };

        setSentimentCounts(sentimentData.map((d: any) => ({ 
        name: d.sentiment, 
        value: d.count,
        // We are now adding the color directly to the data
        color: sentimentColorMap[d.sentiment] || '#6C757D' 
        })));
        // --- END FIX ---

        setInterviews(interviewsData);
        setInsights(insightsData.insights || []); // Use insightsData.insights, fallback to empty array
        setCategoryCounts(categoryData.map((d: any) => ({ name: d.category, value: d.count })));
        setSentimentCounts(sentimentData.map((d: any) => ({ name: d.sentiment, value: d.count })));

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchAllData();
    }
  }, [projectId, router]);

  const handleThematicAnalysis = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setError("Not authenticated."); return; }
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/thematic-analysis`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error('Failed to run thematic analysis.');
      const data = await response.json();
      setThematicAnalysis(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) return <p className="text-center mt-24">Loading Results...</p>;
  if (error) return <p className="text-center mt-24 text-destructive">{`Error: ${error}`}</p>;

  return (
    <main>
      <Link href="/" className="text-sm text-accent hover:underline mb-6 inline-block">&larr; Back to Dashboard</Link>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">User Research Insights</h1>
          <p className="text-base text-muted-foreground mt-1">Track and analyze feedback from your user research sessions.</p>
        </div>
        <button
          onClick={handleThematicAnalysis}
          disabled={isAnalyzing || interviews.length < 2}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50"
        >
          <FiCpu className="mr-2 h-5 w-5"/>
          {isAnalyzing ? 'Finding Themes...' : 'Synthesize Themes'}
        </button>
      </div>

      <NavigationTabs />

      <div className="space-y-12 mt-8">
        <section id="overview">
          <StatsCards totalInsights={insights.length} totalInterviews={interviews.length} />
        </section>

        {thematicAnalysis && (
          <section id="themes">
            <ThematicAnalysisDisplay analysis={thematicAnalysis} />
          </section>
        )}
        
        <section id="charts">
          <InsightsCharts categoryData={categoryCounts} sentimentData={sentimentCounts} />
        </section>
        
        <section id="insights">
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-foreground">Recent Insights</h2>
              <div className="mt-4 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground sm:pl-0">Insight</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">Category</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">Sentiment</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">Priority</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {insights.map((insight: Insight) => (
                          <tr key={insight.id}>
                            <td className="whitespace-normal py-4 pl-4 pr-3 text-sm font-medium text-foreground sm:pl-0">{insight.insight_text}</td>
                            <td className="px-3 py-4 text-sm"><Badge color="gray" text={insight.category} /></td>
                            <td className="px-3 py-4 text-sm">
                              <Badge 
                                color={insight.sentiment === 'positive' ? 'green' : insight.sentiment === 'negative' ? 'red' : 'gray'}
                                text={insight.sentiment} 
                              />
                            </td>
                            <td className="px-3 py-4 text-sm">
                              <Badge
                                color={insight.priority === 'High' ? 'red' : insight.priority === 'Medium' ? 'orange' : 'yellow'}
                                text={insight.priority}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}