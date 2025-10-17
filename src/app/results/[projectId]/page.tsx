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
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  const [filters, setFilters] = useState({ category: '', sentiment: '', priority: '' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      fetchAllData(session.access_token);
    };
    getSession();
  }, [projectId, router, filters, pagination.currentPage]);

  const fetchAllData = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const query = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: '10',
        ...filters
      }).toString();
      
      const [interviewsRes, insightsRes, categoryRes, sentimentRes] = await Promise.all([
        fetch(`${API_URL}/interviews/${projectId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/insights/${projectId}?${query}`, { headers: { 'Authorization': `Bearer ${token}` } }),
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

      setInterviews(interviewsData);
      setInsights(insightsData.insights || []);
      setPagination({
        currentPage: insightsData.currentPage,
        totalPages: insightsData.totalPages,
      });
      setCategoryCounts(categoryData.map((d: any) => ({ name: d.category, value: d.count })));
      setSentimentCounts(sentimentData.map((d: any) => ({ name: d.sentiment, value: d.count })));

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value === 'all' ? '' : value }));
    setPagination(prev => ({...prev, currentPage: 1}));
  };

  if (loading) return <p className="text-center mt-24">Loading Results...</p>;
  if (error) return <p className="text-center mt-24 text-destructive">{`Error: ${error}`}</p>;

  return (
    <main>
      <Link href="/dashboard" className="text-sm text-accent hover:underline mb-6 inline-block">&larr; Back to Dashboard</Link>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Research Insights</h1>
          <p className="text-base text-muted-foreground mt-1">Track and analyze feedback from your user research sessions.</p>
        </div>
        <Button onClick={handleThematicAnalysis} disabled={isAnalyzing || interviews.length < 1}>
          <FiCpu className="mr-2 h-4 w-4"/>
          {isAnalyzing ? 'Synthesizing...' : 'Synthesize Themes'}
        </Button>
      </div>
      
      <div className="space-y-8 mt-8">
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
              <div className="flex items-center space-x-4 my-4">
                <Select onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="UI/UX">UI/UX</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => handleFilterChange('sentiment', value)}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by Sentiment" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sentiments</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                      <tbody className="divide-y divide-border bg-card">
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
              <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
                <span className="text-sm text-muted-foreground">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPagination(p => ({...p, currentPage: p.currentPage - 1}))}
                    disabled={pagination.currentPage <= 1}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPagination(p => ({...p, currentPage: p.currentPage + 1}))}
                    disabled={pagination.currentPage >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}