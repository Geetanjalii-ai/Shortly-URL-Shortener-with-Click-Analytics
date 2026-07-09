import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Link as LinkIcon,
  BarChart3,
  Settings,
  ArrowUpRight,
  Calendar,
  Plus,
  Menu,
  X,
  ExternalLink,
  Copy,
  Check,
  MousePointerClick,
  Globe,
  User,
  Shield,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { writeApi, readApi } from '../services/api';

const countryNames = {
  IN: { name: 'India', flag: '🇮🇳' },
  US: { name: 'United States', flag: '🇺🇸' },
  GB: { name: 'United Kingdom', flag: '🇬🇧' },
  DE: { name: 'Germany', flag: '🇩🇪' },
  CA: { name: 'Canada', flag: '🇨🇦' },
  FR: { name: 'France', flag: '🇫🇷' },
  AU: { name: 'Australia', flag: '🇦🇺' },
  JP: { name: 'Japan', flag: '🇯🇵' },
  SG: { name: 'Singapore', flag: '🇸🇬' },
  BR: { name: 'Brazil', flag: '🇧🇷' }
};

const referrerColors = {
  Google: '#1d64ec',
  Twitter: '#8b5cf6',
  LinkedIn: '#06b6d4',
  Direct: '#f59e0b',
  Other: '#94a3b8'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0e1f33] border border-white/10 shadow-xl rounded-xl px-4 py-3 text-white">
      <p className="text-sm font-semibold text-white/80 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs" style={{ color: entry.color }}>
          {entry.name === 'clicks' ? 'Clicks' : 'Scans'}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsDashboard({ forcePreview = false }) {
  const { user, currentView, setCurrentView } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('links'); // 'links' | 'global' | 'settings'
  const [links, setLinks] = useState([]);
  const [selectedLink, setSelectedLink] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Checks if we should render mock data (preview mode on landing page) or actual user data (dashboard view)
  const isDashboardView = currentView === 'dashboard' && user && !forcePreview;

  // Mock static data for landing page preview
  const mockClicksData = [
    { name: 'Mon', clicks: 1200, scans: 400 },
    { name: 'Tue', clicks: 1800, scans: 600 },
    { name: 'Wed', clicks: 1400, scans: 500 },
    { name: 'Thu', clicks: 2200, scans: 800 },
    { name: 'Fri', clicks: 2800, scans: 1000 },
    { name: 'Sat', clicks: 2400, scans: 900 },
    { name: 'Sun', clicks: 3200, scans: 1100 },
  ];

  const mockReferrerData = [
    { name: 'Google', value: 4500, color: '#1d64ec' },
    { name: 'Twitter', value: 2800, color: '#8b5cf6' },
    { name: 'LinkedIn', value: 2100, color: '#06b6d4' },
    { name: 'Direct', value: 1800, color: '#f59e0b' },
    { name: 'Other', value: 1647, color: '#94a3b8' },
  ];

  const mockLocationData = [
    { country: 'India', flag: '🇮🇳', clicks: '3,847', pct: 29.9 },
    { country: 'United States', flag: '🇺🇸', clicks: '2,941', pct: 22.9 },
    { country: 'United Kingdom', flag: '🇬🇧', clicks: '1,847', pct: 14.4 },
    { country: 'Germany', flag: '🇩🇪', clicks: '1,523', pct: 11.9 },
    { country: 'Canada', flag: '🇨🇦', clicks: '1,247', pct: 9.7 },
  ];

  // Fetch all URLs for user on mount/login
  useEffect(() => {
    if (isDashboardView) {
      fetchUserUrls();
    }
  }, [isDashboardView]);

  const fetchUserUrls = async () => {
    setLoadingLinks(true);
    try {
      const res = await writeApi.get('/api/v1/urls');
      setLinks(res.data);
      if (res.data.length > 0) {
        // Auto-select first link
        setSelectedLink(res.data[0]);
        fetchLinkAnalytics(res.data[0].short_code);
      } else {
        setSelectedLink(null);
        setAnalyticsData(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading links.', 'error');
    } finally {
      setLoadingLinks(false);
    }
  };

  const fetchLinkAnalytics = async (shortCode) => {
    setLoadingAnalytics(true);
    try {
      const res = await readApi.get(`/api/v1/analytics/${shortCode}`);
      setAnalyticsData(res.data);
    } catch (err) {
      console.error(err);
      showToast('Error loading analytics details.', 'error');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleLinkSelect = (link) => {
    setSelectedLink(link);
    fetchLinkAnalytics(link.short_code);
    setSidebarOpen(false);
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(`http://localhost:3002/${code}`);
    setCopiedCode(code);
    showToast('Copied short link to clipboard!', 'success');
    setTimeout(() => setCopiedCode(''), 2000);
  };

  // Helper to detect empty state in logged-in dashboard view
  const hasNoClickEvents = isDashboardView && (!analyticsData || !analyticsData.click_logs || analyticsData.click_logs.length === 0);

  // Parsing dynamic click logs for charts
  const getParsedChartData = () => {
    if (!analyticsData || !analyticsData.click_logs || analyticsData.click_logs.length === 0) {
      if (isDashboardView) {
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => ({ name: d, clicks: 0, scans: 0 }));
      }
      return mockClicksData; // Return mockup curve if no data exists
    }

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dataMap = days.map((d) => ({ name: d, clicks: 0, scans: 0 }));

    analyticsData.click_logs.forEach((log) => {
      if (!log.clicked_at) return;
      const date = new Date(log.clicked_at);
      const dayIndex = date.getDay(); // 0 is Sun, 1 is Mon
      const dayName = days[dayIndex === 0 ? 6 : dayIndex - 1]; // Convert 0-6 index
      
      const isScan = log.platform && log.platform !== 'Direct / Browser';
      const dayObj = dataMap.find((d) => d.name === dayName);
      if (dayObj) {
        if (isScan) dayObj.scans++;
        else dayObj.clicks++;
      }
    });

    return dataMap;
  };

  const getParsedReferrerData = () => {
    if (!analyticsData || !analyticsData.click_logs || analyticsData.click_logs.length === 0) {
      if (isDashboardView) {
        return [];
      }
      return mockReferrerData;
    }

    const counts = { Google: 0, Twitter: 0, LinkedIn: 0, Direct: 0, Other: 0 };
    analyticsData.click_logs.forEach((log) => {
      const ref = log.referrer ? log.referrer.toLowerCase() : 'direct';
      if (ref.includes('google')) counts.Google++;
      else if (ref.includes('twitter') || ref.includes('t.co')) counts.Twitter++;
      else if (ref.includes('linkedin')) counts.LinkedIn++;
      else if (ref === 'direct' || ref.includes('internal')) counts.Direct++;
      else counts.Other++;
    });

    return Object.entries(counts).map(([name, val]) => ({
      name,
      value: val,
      color: referrerColors[name]
    })).filter(item => item.value > 0);
  };

  const getParsedLocationData = () => {
    if (!analyticsData || !analyticsData.click_logs || analyticsData.click_logs.length === 0) {
      if (isDashboardView) {
        return [];
      }
      return mockLocationData;
    }

    const counts = {};
    analyticsData.click_logs.forEach((log) => {
      const code = log.country || 'Unknown';
      counts[code] = (counts[code] || 0) + 1;
    });

    const total = analyticsData.click_logs.length;

    return Object.entries(counts)
      .map(([code, val]) => {
        const countryInfo = countryNames[code] || { name: code, flag: '🌐' };
        return {
          country: countryInfo.name,
          flag: countryInfo.flag,
          clicks: val.toLocaleString(),
          pct: Math.round((val / total) * 1000) / 10
        };
      })
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5);
  };

  // Get aggregated stats for "Global Stats" panel
  const getGlobalStats = () => {
    if (links.length === 0) return { totalClicks: 0, activeLinks: 0, burnLinks: 0 };
    
    let totalClicks = 0;
    let activeLinks = 0;
    let burnLinks = 0;

    links.forEach((link) => {
      totalClicks += parseInt(link.total_clicks || 0, 10);
      if (link.max_clicks === 1) burnLinks++;
      
      const isExpired = link.expires_at && new Date() > new Date(link.expires_at);
      const isClickLimit = link.max_clicks && parseInt(link.total_clicks || 0, 10) >= link.max_clicks;
      if (!isExpired && !isClickLimit) activeLinks++;
    });

    return { totalClicks, activeLinks, burnLinks };
  };

  const parsedChartData = getParsedChartData();
  const parsedReferrerData = getParsedReferrerData();
  const parsedLocationData = getParsedLocationData();

  // If in dashboard view but user logged out, redirect them or prompt
  if (currentView === 'dashboard' && !user) {
    return (
      <section className="bg-navy min-h-screen py-32 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-[#0e1f33] border border-white/10 rounded-2xl p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-[#1d64ec] mx-auto animate-bounce" />
          <h2 className="text-xl font-bold text-white">Protected Workspace</h2>
          <p className="text-white/60 text-sm">Please log in or sign up to access your interactive analytical dashboard.</p>
          <button
            onClick={() => setCurrentView('home')}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="analytics" className={`bg-[#071524] ${isDashboardView ? 'pt-24 pb-12' : 'py-24'} px-4 sm:px-6 lg:px-8`}>
      {/* ── heading (Only shown on Home Preview) ── */}
      {!isDashboardView && (
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Understand your audience
          </h2>
          <p className="text-white/60 text-lg">
            Track, measure, and optimize your links with real-time analytics
          </p>
        </div>
      )}

      {/* ── dashboard layout card ── */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 min-h-[620px]">
          <div className="flex relative min-h-[620px]">
            
            {/* ── Mobile Sidebar Overlay ── */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* ── Sidebar (All My Links list) ── */}
            <aside
              className={`
                w-72 bg-gray-50 border-r border-gray-100 flex-shrink-0 flex flex-col
                fixed inset-y-0 left-0 z-40
                transition-transform duration-300 ease-in-out
                lg:static lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              `}
            >
              {/* Logo / Title */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <span className="text-lg font-bold text-[#071524] tracking-tight flex items-center gap-1.5">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Shortly Workspace
                </span>
                <button
                  className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation items (All links, Global metrics, Settings) */}
              {isDashboardView && (
                <div className="px-4 py-3 border-b border-gray-100 grid grid-cols-3 gap-1">
                  <button
                    onClick={() => setActiveTab('links')}
                    className={`py-1.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition
                      ${activeTab === 'links' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    Links
                  </button>
                  <button
                    onClick={() => setActiveTab('global')}
                    className={`py-1.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition
                      ${activeTab === 'global' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Global
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`py-1.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition
                      ${activeTab === 'settings' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                  </button>
                </div>
              )}

              {/* Link List Panel */}
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {!isDashboardView ? (
                  // Anonymous Preview links
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 block mb-2">Live Demonstration</span>
                    <button className="w-full text-left flex flex-col gap-1 px-4 py-3 rounded-xl bg-primary/10 border-l-[3px] border-primary">
                      <span className="text-xs font-bold text-primary">shortly.link/summer-sale</span>
                      <span className="text-[10px] text-gray-400 truncate">https://example.com/summer-campaign</span>
                    </button>
                    <button className="w-full text-left flex flex-col gap-1 px-4 py-3 rounded-xl hover:bg-gray-100 transition">
                      <span className="text-xs font-semibold text-gray-700">shortly.link/github-repo</span>
                      <span className="text-[10px] text-gray-400 truncate">https://github.com/reactjs</span>
                    </button>
                  </div>
                ) : activeTab === 'links' ? (
                  // Logged-in Links List
                  <>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 block mb-2">My Links ({links.length})</span>
                    {loadingLinks ? (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-xs">Loading Links...</span>
                      </div>
                    ) : links.length === 0 ? (
                      <div className="text-center py-10 px-4">
                        <p className="text-xs text-gray-400">No links created yet.</p>
                        <button
                          onClick={() => setCurrentView('home')}
                          className="mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer bg-transparent border-none"
                        >
                          Create one now
                        </button>
                      </div>
                    ) : (
                      links.map((link) => (
                        <button
                          key={link.id}
                          onClick={() => handleLinkSelect(link)}
                          className={`w-full text-left flex flex-col gap-1 px-3 py-2.5 rounded-lg transition cursor-pointer
                            ${selectedLink?.id === link.id
                              ? 'bg-primary/10 border-l-[3px] border-primary text-primary'
                              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                            }`}
                        >
                          <span className="text-xs font-bold truncate">shortly.link/{link.short_code}</span>
                          <span className="text-[10px] text-gray-400 truncate">{link.long_url}</span>
                          <span className="text-[9px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded self-start mt-1">
                            {link.total_clicks || 0} clicks
                          </span>
                        </button>
                      ))
                    )}
                  </>
                ) : (
                  <div className="p-3 text-center text-xs text-gray-400">
                    Use headers above to swap layout panels.
                  </div>
                )}
              </div>
            </aside>

            {/* ── Main Dashboard Content Area ── */}
            <main className="flex-1 min-w-0 bg-white">
              {/* Header toolbar */}
              <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-gray-100">
                <button
                  className="lg:hidden text-gray-500 hover:text-gray-700 mr-1 cursor-pointer"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={22} />
                </button>

                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {!isDashboardView 
                      ? 'Demonstrative Analytics' 
                      : activeTab === 'links' 
                      ? `Analytics for /${selectedLink?.short_code || ''}`
                      : activeTab === 'global'
                      ? 'Global Performance Summary'
                      : 'Account Workspace Settings'}
                  </h3>
                </div>

                <div className="ml-auto flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-4 py-1.5 text-xs font-semibold text-gray-600">
                    <Calendar size={13} />
                    Last 7 days
                  </span>
                  {isDashboardView && activeTab === 'links' && selectedLink && (
                    <button 
                      onClick={() => copyToClipboard(selectedLink.short_code)}
                      className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg transition"
                    >
                      {copiedCode === selectedLink.short_code ? <Check size={13} /> : <Copy size={13} />}
                      Copy Short URL
                    </button>
                  )}
                </div>
              </div>

              {/* Inner Panels */}
              <div className="p-6 space-y-6">
                
                {/* ── PANEL 1: LINKS ANALYTICS VIEW ── */}
                {(!isDashboardView || activeTab === 'links') && (
                  <>
                    {loadingAnalytics ? (
                      <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="text-sm font-medium">Fetching real-time analytics data...</span>
                      </div>
                    ) : !selectedLink && isDashboardView ? (
                      <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600">No URL selected</p>
                        <p className="text-xs text-gray-400">Shorten a URL on the home tab to start collecting analytics.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* URL Details Card */}
                        {isDashboardView && selectedLink && (
                          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm">
                            <div className="space-y-1">
                              <p className="font-bold text-gray-900">Destination URL</p>
                              <a href={selectedLink.long_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 break-all pr-4">
                                {selectedLink.long_url}
                                <ExternalLink size={13} />
                              </a>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              {selectedLink.max_clicks && (
                                <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-md text-xs font-semibold border border-orange-100">
                                  Limit: {selectedLink.max_clicks} Clicks
                                </span>
                              )}
                              {selectedLink.expires_at && (
                                <span className="bg-purple-50 text-purple-600 px-2.5 py-1 rounded-md text-xs font-semibold border border-purple-100">
                                  Expires: {new Date(selectedLink.expires_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Stat Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Clicks</p>
                            <div className="flex items-end justify-between">
                              <span className="text-2xl font-bold text-gray-900">
                                {isDashboardView ? (analyticsData?.total_clicks || 0) : '12,847'}
                              </span>
                              <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <ArrowUpRight size={13} className="mr-0.5" />
                                +12.5%
                              </span>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Unique Visitors</p>
                            <div className="flex items-end justify-between">
                              <span className="text-2xl font-bold text-gray-900">
                                {isDashboardView 
                                  ? (analyticsData?.click_logs 
                                    ? new Set(analyticsData.click_logs.map(log => log.city + log.country)).size 
                                    : 0) 
                                  : '8,392'}
                              </span>
                              <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <ArrowUpRight size={13} className="mr-0.5" />
                                +8.3%
                              </span>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Avg. CTR Rate</p>
                            <div className="flex items-end justify-between">
                              <span className="text-2xl font-bold text-gray-900">
                                {selectedLink?.max_clicks 
                                  ? `${Math.round(((analyticsData?.total_clicks || 0) / selectedLink.max_clicks) * 1000) / 10}%`
                                  : '4.2%'}
                              </span>
                              <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <ArrowUpRight size={13} className="mr-0.5" />
                                +2.1%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Chart Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* area chart */}
                          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-1.5">
                              <MousePointerClick className="w-4 h-4 text-primary" />
                              Clicks + Scans over time
                            </h4>
                            {hasNoClickEvents ? (
                              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-100 min-h-[220px]">
                                <MousePointerClick className="w-8 h-8 text-gray-300 mb-1 animate-pulse" />
                                <p className="text-xs font-semibold text-gray-400">No click data available for this period yet</p>
                                <p className="text-[10px] text-gray-300 mt-0.5">Share your link to start collecting analytics telemetry.</p>
                              </div>
                            ) : (
                              <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={parsedChartData}>
                                  <defs>
                                    <linearGradient id="gradClicks" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#1d64ec" stopOpacity={0.15} />
                                      <stop offset="100%" stopColor="#1d64ec" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradScans" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Area type="monotone" dataKey="clicks" stroke="#1d64ec" strokeWidth={2} fill="url(#gradClicks)" />
                                  <Area type="monotone" dataKey="scans" stroke="#8b5cf6" strokeWidth={2} fill="url(#gradScans)" />
                                </AreaChart>
                              </ResponsiveContainer>
                            )}
                          </div>

                          {/* doughnut chart */}
                          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                              <Globe className="w-4 h-4 text-primary" />
                              Clicks by referrer
                            </h4>
                            
                            {parsedReferrerData.length === 0 ? (
                              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-100 min-h-[160px]">
                                <Globe className="w-8 h-8 text-gray-300 mb-1 animate-pulse" />
                                <p className="text-xs font-semibold text-gray-400">No referrer data available yet</p>
                                <p className="text-[10px] text-gray-300 mt-0.5">Sources will appear once link is clicked.</p>
                              </div>
                            ) : (
                              <>
                                <ResponsiveContainer width="100%" height={160}>
                                  <PieChart>
                                    <Pie
                                      data={parsedReferrerData}
                                      dataKey="value"
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={50}
                                      outerRadius={70}
                                      paddingAngle={3}
                                    >
                                      {parsedReferrerData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                      ))}
                                    </Pie>
                                  </PieChart>
                                </ResponsiveContainer>

                                <ul className="space-y-2 mt-3">
                                  {parsedReferrerData.map((r) => (
                                    <li key={r.name} className="flex items-center justify-between text-xs">
                                      <span className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                                        <span className="text-gray-600">{r.name}</span>
                                      </span>
                                      <span className="font-semibold text-gray-900">{r.value}</span>
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </div>

                          {/* demographics table */}
                          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">Top demographic geolocations</h4>
                            {parsedLocationData.length === 0 ? (
                              <div className="flex flex-col items-center justify-center text-center py-10 px-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-100">
                                <Globe className="w-8 h-8 text-gray-300 mb-1 animate-pulse" />
                                <p className="text-xs font-semibold text-gray-400">No geographic data available yet</p>
                                <p className="text-[10px] text-gray-300 mt-0.5">Demographics logs will appear once clicks are recorded.</p>
                              </div>
                            ) : (
                              <div className="space-y-3.5">
                                {parsedLocationData.map((loc) => (
                                  <div key={loc.country} className="flex items-center gap-4">
                                    <span className="text-lg leading-none">{loc.flag}</span>
                                    <span className="w-32 text-xs font-semibold text-gray-700 truncate">{loc.country}</span>
                                    <span className="w-16 text-xs text-gray-400 text-right">{loc.clicks} clicks</span>
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-primary rounded-full transition-all duration-700"
                                        style={{ width: `${loc.pct}%` }}
                                      />
                                    </div>
                                    <span className="w-12 text-xs font-semibold text-gray-500 text-right">{loc.pct}%</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ── PANEL 2: GLOBAL STATISTICS VIEW ── */}
                {isDashboardView && activeTab === 'global' && (
                  <div className="space-y-6 animate-[fadeIn_0.25s_ease]">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="p-6 rounded-xl border border-gray-100 bg-gray-50 text-center">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Workspace Clicks</p>
                        <p className="text-3xl font-extrabold text-[#071524]">{getGlobalStats().totalClicks}</p>
                      </div>
                      <div className="p-6 rounded-xl border border-gray-100 bg-gray-50 text-center">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Smart Links</p>
                        <p className="text-3xl font-extrabold text-[#071524]">{getGlobalStats().activeLinks} / {links.length}</p>
                      </div>
                      <div className="p-6 rounded-xl border border-gray-100 bg-gray-50 text-center">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Burn-on-Click Links</p>
                        <p className="text-3xl font-extrabold text-[#071524]">{getGlobalStats().burnLinks}</p>
                      </div>
                    </div>

                    {/* Quick Guide */}
                    <div className="p-6 rounded-2xl border border-primary/10 bg-primary/5 text-sm space-y-2">
                      <h4 className="font-bold text-primary flex items-center gap-1.5">
                        <Shield className="w-4 h-4" />
                        Workspace Security Audit Log
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        Shortly aggregates all click analytics dynamically across your profile links. You are currently sharing 
                        <strong className="text-gray-900 mx-1">{links.length} shortened links</strong>. 
                        To secure or modify any redirection rules (e.g. adding click thresholds or expiration dates), click on individual urls in the left sidebar menu.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── PANEL 3: USER SETTINGS VIEW ── */}
                {isDashboardView && activeTab === 'settings' && (
                  <div className="space-y-6 max-w-xl animate-[fadeIn_0.25s_ease]">
                    <div className="p-6 rounded-xl border border-gray-100 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-base">{user.username}</h4>
                          <p className="text-xs text-gray-400">Authenticated shortly member</p>
                        </div>
                      </div>

                      <div className="my-2 border-t border-gray-100" />

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Username</span>
                          <span className="font-semibold text-gray-700">{user.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Email Address</span>
                          <span className="font-semibold text-gray-700">{user.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Account ID</span>
                          <span className="font-mono text-xs text-gray-700">usr_#{user.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl border border-rose-100 bg-rose-50/20 space-y-2">
                      <h4 className="font-bold text-rose-600 text-sm">Danger Zone</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Permanently delete your Shortly user account, shredding all shortened routing rules and analytics click metrics. This action is irreversible.
                      </p>
                      <button className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-not-allowed">
                        Request account deletion
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </main>

          </div>
        </div>
      </div>
    </section>
  );
}
