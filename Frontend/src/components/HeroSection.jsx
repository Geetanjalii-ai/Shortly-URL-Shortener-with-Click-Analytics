import { useState, useEffect } from 'react';
import { Link2, QrCode, ChevronDown, Sparkles, Shield, Calendar, MousePointer, Copy, Check, Eye, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { writeApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

// ── Pattern style thumbnails ────────────────────────────────────────────────
function PatternOption({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-200 cursor-pointer
        ${active
          ? 'border-[#1d64ec] bg-[#1d64ec]/10 scale-105'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
        }`}
    >
      {children}
    </button>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function HeroSection() {
  const [activeTab, setActiveTab] = useState('shortlink');
  const [longUrl, setLongUrl] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [selectedCorner, setSelectedCorner] = useState(0);
  const [selectedDotColor, setSelectedDotColor] = useState('#000000');
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [selectedDomain, setSelectedDomain] = useState('shortly.link');

  // Advanced options state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [maxClicks, setMaxClicks] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [burnAfterClick, setBurnAfterClick] = useState(false);

  // Result state
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Social OG Preview state
  const [ogData, setOgData] = useState({
    title: 'Shortly — Premium URL Shortener',
    description: 'Create smart, secure, and ephemeral links with real-time open-graph previews and analytics.',
    domain: 'shortly.link',
    imageBg: 'from-blue-600 to-indigo-600',
  });

  const { showToast } = useToast();
  const { user } = useAuth();

  const dotColors = [
    '#000000', '#1d64ec', '#8b5cf6', '#ec4899',
    '#10b981', '#f59e0b', '#ef4444',
  ];

  // Dynamic OG generator as user types longUrl
  useEffect(() => {
    if (!longUrl) {
      setOgData({
        title: 'Shortly — Premium URL Shortener',
        description: 'Create smart, secure, and ephemeral links with real-time open-graph previews and analytics.',
        domain: 'shortly.link',
        imageBg: 'from-blue-600 to-indigo-600',
      });
      return;
    }

    try {
      const urlObj = new URL(longUrl);
      const host = urlObj.hostname.replace('www.', '');
      
      // Customize based on major domains
      if (host.includes('github.com')) {
        setOgData({
          title: 'GitHub: Let’s build from here · GitHub',
          description: 'GitHub is where over 100 million developers shape the future of software, together.',
          domain: host,
          imageBg: 'from-neutral-800 to-neutral-900',
        });
      } else if (host.includes('youtube.com') || host.includes('youtu.be')) {
        setOgData({
          title: 'YouTube - Watch, Share, Stream',
          description: 'Enjoy the videos and music you love, upload original content, and share it all with friends.',
          domain: host,
          imageBg: 'from-red-600 to-rose-700',
        });
      } else if (host.includes('linkedin.com')) {
        setOgData({
          title: 'LinkedIn: Log In or Sign Up',
          description: 'Manage your professional identity. Build and engage with your professional network.',
          domain: host,
          imageBg: 'from-blue-700 to-sky-800',
        });
      } else if (host.includes('google.com')) {
        setOgData({
          title: 'Google Search',
          description: 'Search the world\'s information, including webpages, images, videos and more.',
          domain: host,
          imageBg: 'from-emerald-500 via-yellow-500 to-rose-500',
        });
      } else {
        setOgData({
          title: `${host.charAt(0).toUpperCase() + host.slice(1).split('.')[0]} — Homepage`,
          description: `Visit ${host} for premium services, information, updates, and secure connections.`,
          domain: host,
          imageBg: 'from-[#1d64ec] to-[#8b5cf6]',
        });
      }
    } catch (e) {
      // Just fallback if partial URL
      setOgData({
        title: 'Link Preview Loading...',
        description: 'Type a valid destination URL to render dynamic social media card metadata cards.',
        domain: 'resolving...',
        imageBg: 'from-gray-700 to-slate-800 animate-pulse',
      });
    }
  }, [longUrl]);

  // Submit shorten request
  const handleShorten = async (e) => {
    e.preventDefault();
    if (!longUrl) {
      showToast('Please enter a target URL.', 'error');
      return;
    }

    setLoading(true);
    setShortenedUrl('');
    setShortCode('');

    // Calculate expiresInMinutes from expireDate date picker
    let expiresInMinutes = null;
    if (expireDate) {
      const diffMs = new Date(expireDate).getTime() - Date.now();
      expiresInMinutes = Math.max(1, Math.round(diffMs / 60000));
    }

    try {
      const response = await writeApi.post('/api/v1/shorten', {
        longUrl,
        customAlias: customAlias || undefined,
        maxClicks: maxClicks ? parseInt(maxClicks, 10) : undefined,
        expiresInMinutes,
        burnAfterClick,
        domain: selectedDomain,
      });

      const data = response.data;
      setShortenedUrl(data.shortUrl);
      setShortCode(data.shortCode);
      showToast('Link shortened successfully!', 'success');
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.error || 'Failed to shorten URL. Make sure it is a valid URL.';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getQrStyle = () => {
    const borderRadii = ['0px', '8px', '16px', '28px'];
    const borderRadius = borderRadii[selectedCorner] || '0px';

    const styles = [
      { borderRadius, transition: 'all 0.3s ease' },
      { borderRadius, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))', transition: 'all 0.3s ease' },
      { borderRadius, filter: 'contrast(1.15) saturate(1.05)', transition: 'all 0.3s ease' },
      { borderRadius, filter: 'opacity(0.9)', transition: 'all 0.3s ease' }
    ];

    return styles[selectedPattern] || styles[0];
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortenedUrl);
    setCopied(true);
    showToast('Copied short link to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svgEl = document.getElementById('qr-code-svg');
    if (!svgEl) {
      showToast('Could not find QR Code SVG to download.', 'error');
      return;
    }

    const serializer = new XMLSerializer();
    let innerSvg = serializer.serializeToString(svgEl);

    let svgContent = innerSvg;
    if (selectedFrame > 0) {
      const framePadding = 20;
      const outerSize = 200 + framePadding * 2;
      const frameRadius = selectedFrame === 2 ? 36 : 16;
      const strokeDash = selectedFrame === 3 ? '8,6' : 'none';
      
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${outerSize}" height="${outerSize}" viewBox="0 0 ${outerSize} ${outerSize}">
        <rect width="100%" height="100%" fill="#ffffff" />
        <!-- Frame -->
        <rect x="2" y="2" width="${outerSize - 4}" height="${outerSize - 4}" fill="none" stroke="${selectedDotColor}" stroke-width="4" stroke-dasharray="${strokeDash}" rx="${frameRadius}" />
        <!-- Inner QR -->
        <g transform="translate(${framePadding}, ${framePadding})">
          ${innerSvg}
        </g>
      </svg>`;
    }

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `qrcode-${shortCode || 'shortly'}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    
    showToast('QR Code SVG downloaded successfully!', 'success');
  };

  return (
    <section id="platform" className="relative min-h-screen overflow-hidden bg-[#071524]">
      {/* Radial gradient grid overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(circle at 20% 30%, rgba(29,100,236,0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 60%, rgba(139,92,246,0.06) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(29,100,236,0.04) 0%, transparent 40%)',
            'radial-gradient(circle 1px at center, rgba(255,255,255,0.03) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '100% 100%, 100% 100%, 100% 100%, 32px 32px',
        }}
      />

      {/* Floating animated blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-[#1d64ec]/20 blur-[120px] animate-pulse" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-[340px] w-[340px] rounded-full bg-[#8b5cf6]/15 blur-[100px] animate-pulse [animation-delay:1.5s]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-[280px] w-[280px] rounded-full bg-[#1d64ec]/10 blur-[90px] animate-pulse [animation-delay:3s]" />

      {/* Content Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        
        {/* Hero text */}
        <div className="mb-14 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
            Build stronger
            <br />
            digital connections
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
            Use Shortly's URL shortener, QR Codes, and Link-in-bio page to
            engage your audience and connect them to the right information.
          </p>
        </div>

        {/* Tabbed Interface Container */}
        <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur-xl">
          {/* Tabs */}
          <div className="flex gap-1 rounded-xl bg-white/[0.03] p-1">
            <button
              onClick={() => setActiveTab('shortlink')}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all duration-300
                ${activeTab === 'shortlink'
                  ? 'bg-[#1d64ec] text-white shadow-lg shadow-[#1d64ec]/25'
                  : 'text-white/60 hover:text-white'
                }`}
            >
              <Link2 size={16} />
              Short Link
            </button>
            <button
              onClick={() => setActiveTab('qrcode')}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all duration-300
                ${activeTab === 'qrcode'
                  ? 'bg-[#1d64ec] text-white shadow-lg shadow-[#1d64ec]/25'
                  : 'text-white/60 hover:text-white'
                }`}
            >
              <QrCode size={16} />
              QR Code
            </button>
          </div>

          {/* Tab Panels */}
          <div className="p-5 sm:p-6">
            
            {/* ===== SHORT LINK VIEW ===== */}
            {activeTab === 'shortlink' && (
              <div className="animate-[fadeIn_0.35s_ease] space-y-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Left Column - Inputs (60%) */}
                  <form onSubmit={handleShorten} className="lg:col-span-3 space-y-4">
                    {/* Destination URL */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Destination URL</label>
                      <input
                        type="url"
                        value={longUrl}
                        onChange={(e) => setLongUrl(e.target.value)}
                        placeholder="Paste your long URL (e.g., https://github.com/reactjs)"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-base text-white placeholder:text-white/20 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>

                    {/* Domain & Alias */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Domain</label>
                        <div className="relative">
                          <select
                            value={selectedDomain}
                            onChange={(e) => setSelectedDomain(e.target.value)}
                            className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 pr-10 text-sm text-white outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="shortly.link" className="bg-[#0e1f33]">shortly.link</option>
                          </select>
                          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Custom Alias (Optional)</label>
                        <input
                          type="text"
                          value={customAlias}
                          onChange={(e) => setCustomAlias(e.target.value)}
                          placeholder="e.g. summer-sale"
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    {/* Advanced Accordion Header */}
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-sm font-semibold text-[#1d64ec] hover:text-[#1d64ec]/80 transition cursor-pointer pt-1"
                    >
                      <Shield size={16} />
                      {showAdvanced ? 'Hide' : 'Show'} Advanced Link Security & Controls
                      <ChevronDown size={14} className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Advanced Controls Drawer */}
                    {showAdvanced && (
                      <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-4 animate-[fadeIn_0.25s_ease]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Max Click Counter */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                              <MousePointer size={13} />
                              Max Click Counter
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={maxClicks}
                              onChange={(e) => setMaxClicks(e.target.value)}
                              disabled={burnAfterClick}
                              placeholder="Clicks threshold (e.g. 100)"
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:opacity-40"
                            />
                          </div>

                          {/* Expiration Date Picker */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                              <Calendar size={13} />
                              Expiration Timestamp
                            </label>
                            <input
                              type="datetime-local"
                              value={expireDate}
                              onChange={(e) => setExpireDate(e.target.value)}
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                        </div>

                        {/* Burn-After-Reading Toggle */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                          <div>
                            <p className="text-sm font-semibold text-white">Burn-After-Clicking</p>
                            <p className="text-xs text-white/40">Self-destruct link permanently after its very first execution.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setBurnAfterClick(!burnAfterClick);
                              if (!burnAfterClick) setMaxClicks('1'); // Force 1 click
                            }}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                              ${burnAfterClick ? 'bg-primary' : 'bg-white/10'}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                ${burnAfterClick ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Shorten CTA Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full cursor-pointer rounded-xl bg-[#1d64ec] py-4 text-base font-bold text-white shadow-lg shadow-[#1d64ec]/25 transition-all duration-300 hover:scale-105 hover:bg-[#1550c8] flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Get your link for free &rarr;</>
                      )}
                    </button>
                  </form>

                  {/* Right Column - Preview OR Success Card */}
                  <div className="lg:col-span-2 space-y-2.5">
                    {!shortenedUrl ? (
                      <>
                        <span className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5 animate-[fadeIn_0.25s_ease]">
                          <Eye size={13} className="text-primary" />
                          Social Media Live Card Preview
                        </span>

                        <div className="rounded-xl border border-white/10 bg-[#0e1f33]/70 overflow-hidden shadow-2xl animate-[fadeIn_0.25s_ease]">
                          {/* Simulated image block */}
                          <div className={`h-36 bg-gradient-to-tr ${ogData.imageBg} p-6 flex flex-col justify-between relative overflow-hidden`}>
                            {/* Organic layout details */}
                            <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse" />
                            <Link2 className="w-8 h-8 text-white/85" />
                            <span className="text-xs font-bold text-white/90 bg-white/10 px-2 py-0.5 rounded backdrop-blur-md self-start uppercase tracking-wider">
                              {ogData.domain}
                            </span>
                          </div>
                          
                          {/* Meta text block */}
                          <div className="p-4 space-y-2 bg-[#091421]">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-[#1d64ec]">{ogData.domain}</p>
                            <h4 className="text-sm font-bold text-white line-clamp-1">{ogData.title}</h4>
                            <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">{ogData.description}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 animate-[fadeIn_0.25s_ease]">
                          <Check className="w-4 h-4 text-emerald-400" />
                          Success! Link Ready
                        </span>

                        <div className="rounded-xl border border-emerald-500/20 bg-[#0e1f33]/90 p-5 shadow-2xl relative overflow-hidden space-y-4 animate-[fadeIn_0.25s_ease] min-h-[220px] flex flex-col justify-between">
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-md">
                                shortened rule active
                              </span>
                              {burnAfterClick && (
                                <span className="text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2.5 py-0.5 rounded-md">
                                  burn-after-clicking
                                </span>
                              )}
                            </div>

                            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Shortened URL</p>
                            <div className="text-white font-bold text-base break-all pr-2 hover:text-primary transition-colors">
                              <a href={shortenedUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:underline">
                                {shortenedUrl}
                                <ExternalLink size={12} className="opacity-60 flex-shrink-0" />
                              </a>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <button
                              onClick={handleCopy}
                              className="w-full cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.98] text-xs"
                            >
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              {copied ? 'Copied' : 'Copy to Clipboard'}
                            </button>

                            <button
                              onClick={() => {
                                setShortenedUrl('');
                                setLongUrl('');
                                setCustomAlias('');
                                setMaxClicks('');
                                setExpireDate('');
                                setBurnAfterClick(false);
                              }}
                              className="w-full cursor-pointer border border-white/10 hover:bg-white/5 text-white/70 hover:text-white font-semibold py-2 px-4 rounded-xl flex items-center justify-center transition text-[10px]"
                            >
                              Shorten another link
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ===== QR CODE VIEW ===== */}
            {activeTab === 'qrcode' && (
              <div className="animate-[fadeIn_0.35s_ease] flex flex-col gap-6 lg:flex-row">
                {/* Left – controls (60%) */}
                <div className="flex-[3] space-y-5">
                  <input
                    type="url"
                    value={qrUrl}
                    onChange={(e) => setQrUrl(e.target.value)}
                    placeholder="Enter your destination URL"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-base text-white placeholder:text-white/30 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  />

                  {/* Pattern Style */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">Pattern Style</h4>
                    <div className="flex gap-2">
                      {[0,1,2,3].map((i) => (
                        <PatternOption key={i} active={selectedPattern === i} onClick={() => setSelectedPattern(i)}>
                          <div className="grid grid-cols-3 gap-[3px]">
                            {Array.from({ length: 9 }).map((_, j) => (
                              <div
                                key={j}
                                className="h-[5px] w-[5px] transition-colors"
                                style={{
                                  backgroundColor: (j + i) % 2 === 0 ? '#fff' : 'transparent',
                                  borderRadius: i >= 2 ? '50%' : `${i}px`,
                                }}
                              />
                            ))}
                          </div>
                        </PatternOption>
                      ))}
                    </div>
                  </div>

                  {/* Corner Style */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">Corner Style</h4>
                    <div className="flex gap-2">
                      {[0, 4, 8, 12].map((radius, i) => (
                        <PatternOption key={i} active={selectedCorner === i} onClick={() => setSelectedCorner(i)}>
                          <div
                            className="h-7 w-7 border-2 border-white/70 transition-all"
                            style={{ borderRadius: `${radius}px` }}
                          />
                        </PatternOption>
                      ))}
                    </div>
                  </div>

                  {/* Dot Color */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">Dot Color</h4>
                    <div className="flex gap-2.5">
                      {dotColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedDotColor(color)}
                          className={`h-8 w-8 cursor-pointer rounded-full border-2 transition-all duration-200 hover:scale-110
                            ${selectedDotColor === color
                              ? 'scale-110 border-white ring-2 ring-primary ring-offset-2 ring-offset-[#071524]'
                              : 'border-white/20'
                            }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Frame Style */}
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">Frame Style</h4>
                    <div className="flex gap-2">
                      {[0,1,2,3].map((i) => (
                        <PatternOption key={i} active={selectedFrame === i} onClick={() => setSelectedFrame(i)}>
                          <div className="relative flex h-7 w-7 items-center justify-center">
                            <div
                              className="absolute inset-0 border-2 border-white/60 transition-all"
                              style={{
                                borderRadius: i === 0 ? '2px' : i === 1 ? '6px' : i === 2 ? '50%' : '2px',
                                borderStyle: i === 3 ? 'dashed' : 'solid',
                              }}
                            />
                            <div className="h-3 w-3 rounded-[1px] bg-white/50" />
                          </div>
                        </PatternOption>
                      ))}
                    </div>
                  </div>

                  {/* Generate & Download QR Code Button */}
                  <button
                    type="button"
                    onClick={handleDownloadQR}
                    className="w-full cursor-pointer rounded-xl bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 mt-4 text-sm"
                  >
                    <QrCode size={16} />
                    Generate & Download QR Code
                  </button>
                </div>

                {/* Right – QR preview (40%) */}
                <div className="flex flex-[2] items-start justify-center pt-2 lg:pt-0">
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl animate-pulse" />
                    <div className="relative rounded-2xl bg-white p-8 shadow-2xl">
                      <div className="flex flex-col items-center gap-4">
                        <div
                          className={`p-3 transition-all duration-300 bg-white ${
                            selectedFrame === 0 
                              ? 'border-0' 
                              : selectedFrame === 1 
                              ? 'border-4 border-solid' 
                              : selectedFrame === 2 
                              ? 'border-4 border-solid rounded-[24px]' 
                              : 'border-4 border-dashed'
                          }`}
                          style={{ 
                            borderColor: selectedDotColor,
                            borderRadius: selectedFrame === 2 ? '28px' : '12px'
                          }}
                        >
                          <QRCodeSVG
                            id="qr-code-svg"
                            value={qrUrl || shortenedUrl || 'https://shortly.link'}
                            size={200}
                            level="H"
                            fgColor={selectedDotColor}
                            bgColor="#ffffff"
                            imageSettings={{
                              src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="${encodeURIComponent(selectedDotColor)}"/><text x="20" y="26" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">S</text></svg>`,
                              height: 38,
                              width: 38,
                              excavate: true,
                            }}
                            style={getQrStyle()}
                          />
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                          <Sparkles size={14} className="text-[#1d64ec]" />
                          Scan me
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
