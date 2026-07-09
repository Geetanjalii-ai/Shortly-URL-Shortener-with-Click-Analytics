import {
  CheckCircle2,
  Share2,
  Send,
  ExternalLink,
  Code2,
  Link2,
  ArrowUpRight,
  BarChart3,
  QrCode,
  TrendingUp,
  Globe,
  Smartphone,
  MousePointerClick,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Visual Card — Row 1: Link Management                              */
/* ------------------------------------------------------------------ */
function LinkManagementCard() {
  return (
    <div className="bg-gray-50 rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      {/* Main analytics card */}
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1d64ec]/10 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-[#1d64ec]" />
            </div>
            <span className="text-sm font-semibold text-[#071524]">
              Link Analytics
            </span>
          </div>
          <span className="text-xs text-gray-400">Last 7 days</span>
        </div>

        {/* Shortened link display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-[#1d64ec]">
              shortly.link/summer-sale
            </span>
            <ArrowUpRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xs text-gray-400 truncate">
            https://example.com/campaigns/summer-sale-2025-landing
          </p>
        </div>

        {/* Click count + sparkline */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-[#071524]">2,847</p>
            <p className="text-sm text-gray-500">Total clicks</p>
          </div>

          {/* Mini sparkline bars */}
          <div className="flex items-end gap-1 h-10">
            {[40, 55, 35, 65, 50, 75, 90, 60, 80, 70, 95, 85].map(
              (h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-[#1d64ec]"
                  style={{ height: `${h}%`, opacity: 0.3 + (i / 12) * 0.7 }}
                />
              )
            )}
          </div>
        </div>

        {/* Social share row */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400 mr-auto">Share via</span>
          {[Share2, Send, ExternalLink].map((Icon, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#1d64ec]/10 transition-colors cursor-pointer"
            >
              <Icon className="w-3.5 h-3.5 text-gray-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Visual Card — Row 2: Analytics                                     */
/* ------------------------------------------------------------------ */
function AnalyticsCard() {
  const bars = [45, 62, 38, 75, 55, 85, 70, 92, 60, 80, 95, 72];

  return (
    <div className="bg-gray-50 rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-5">
        {/* Real-time badge + header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              Real-time
            </span>
          </div>
          <BarChart3 className="w-4 h-4 text-gray-400" />
        </div>

        {/* Big number */}
        <div>
          <p className="text-4xl font-bold text-[#071524] tracking-tight">
            12,847
          </p>
          <p className="text-sm text-gray-500 mt-1">Total clicks today</p>
        </div>

        {/* Mini bar chart */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-end gap-1.5 h-16">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t transition-all duration-500"
                style={{
                  height: `${h}%`,
                  background:
                    i === bars.length - 1
                      ? "#1d64ec"
                      : i >= bars.length - 3
                        ? "rgba(29,100,236,0.5)"
                        : "rgba(29,100,236,0.2)",
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-gray-400">12 AM</span>
            <span className="text-[10px] text-gray-400">6 AM</span>
            <span className="text-[10px] text-gray-400">12 PM</span>
            <span className="text-[10px] text-gray-400">Now</span>
          </div>
        </div>

        {/* Trend indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2.5 py-1 rounded-full">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">+23.5%</span>
          </div>
          <span className="text-xs text-gray-400">vs yesterday</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Visual Card — Row 3: QR Codes                                      */
/* ------------------------------------------------------------------ */
function QRCodeCard() {
  const palette = ["#1d64ec", "#071524", "#6366f1", "#10b981", "#f59e0b"];

  return (
    <div className="bg-gray-50 rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center space-y-5">
        {/* QR header */}
        <div className="flex items-center gap-2 self-start">
          <div className="w-8 h-8 rounded-lg bg-[#1d64ec]/10 flex items-center justify-center">
            <QrCode className="w-4 h-4 text-[#1d64ec]" />
          </div>
          <span className="text-sm font-semibold text-[#071524]">
            QR Preview
          </span>
        </div>

        {/* QR code mockup */}
        <div className="bg-gray-50 rounded-xl p-6 w-full flex items-center justify-center">
          <div className="relative">
            {/* Stylized QR grid */}
            <svg
              width="140"
              height="140"
              viewBox="0 0 140 140"
              className="drop-shadow-sm"
            >
              {/* Corner squares */}
              <rect x="4" y="4" width="36" height="36" rx="4" fill="#071524" />
              <rect
                x="10"
                y="10"
                width="24"
                height="24"
                rx="2"
                fill="white"
              />
              <rect
                x="16"
                y="16"
                width="12"
                height="12"
                rx="1"
                fill="#1d64ec"
              />

              <rect
                x="100"
                y="4"
                width="36"
                height="36"
                rx="4"
                fill="#071524"
              />
              <rect
                x="106"
                y="10"
                width="24"
                height="24"
                rx="2"
                fill="white"
              />
              <rect
                x="112"
                y="16"
                width="12"
                height="12"
                rx="1"
                fill="#1d64ec"
              />

              <rect
                x="4"
                y="100"
                width="36"
                height="36"
                rx="4"
                fill="#071524"
              />
              <rect
                x="10"
                y="106"
                width="24"
                height="24"
                rx="2"
                fill="white"
              />
              <rect
                x="16"
                y="112"
                width="12"
                height="12"
                rx="1"
                fill="#1d64ec"
              />

              {/* Data modules */}
              {[
                [48, 8],
                [60, 8],
                [72, 8],
                [84, 8],
                [48, 20],
                [72, 20],
                [48, 32],
                [60, 32],
                [84, 32],
                [8, 48],
                [20, 48],
                [32, 48],
                [48, 48],
                [60, 48],
                [72, 48],
                [84, 48],
                [96, 48],
                [108, 48],
                [120, 48],
                [8, 60],
                [32, 60],
                [48, 60],
                [72, 60],
                [96, 60],
                [120, 60],
                [8, 72],
                [20, 72],
                [32, 72],
                [48, 72],
                [60, 72],
                [72, 72],
                [84, 72],
                [96, 72],
                [108, 72],
                [120, 72],
                [8, 84],
                [32, 84],
                [60, 84],
                [84, 84],
                [108, 84],
                [48, 96],
                [60, 96],
                [72, 96],
                [96, 96],
                [120, 96],
                [48, 108],
                [84, 108],
                [96, 108],
                [120, 108],
                [48, 120],
                [60, 120],
                [72, 120],
                [84, 120],
                [96, 120],
                [108, 120],
                [120, 120],
              ].map(([x, y], i) => (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width="8"
                  height="8"
                  rx="1.5"
                  fill={i % 5 === 0 ? "#1d64ec" : "#071524"}
                  opacity={0.7 + Math.random() * 0.3}
                />
              ))}

              {/* Center logo circle */}
              <circle cx="70" cy="70" r="14" fill="white" />
              <circle cx="70" cy="70" r="10" fill="#1d64ec" />
              <text
                x="70"
                y="74"
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
              >
                S
              </text>
            </svg>
          </div>
        </div>

        {/* Color palette */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-xs text-gray-400">Colors</span>
          <div className="flex items-center gap-2 ml-auto">
            {palette.map((color, i) => (
              <button
                key={i}
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
                aria-label={`Color ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Scan stats */}
        <div className="flex items-center justify-between w-full pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">1,204 scans</span>
          </div>
          <span className="text-xs text-[#1d64ec] font-medium cursor-pointer hover:underline">
            Download
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature Row                                                        */
/* ------------------------------------------------------------------ */
function FeatureRow({ badge, heading, description, items, cta, visual, reverse, id }) {
  return (
    <div
      id={id}
      className={`flex flex-col ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-20`}
    >
      {/* Text side */}
      <div className="flex-1 space-y-5">
        <span className="inline-block bg-[#1d64ec]/10 text-[#1d64ec] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
          {badge}
        </span>
        <h3 className="text-3xl font-extrabold text-[#071524] tracking-tight">{heading}</h3>
        {description && (
          <p className="text-gray-500 leading-relaxed text-sm">
            {description}
          </p>
        )}
        <ul className="space-y-2.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#1d64ec] flex-shrink-0" />
              <span className="text-gray-600 text-sm">{item}</span>
            </li>
          ))}
        </ul>
        <a
          href="#"
          className="inline-block text-[#1d64ec] hover:underline font-bold text-sm transition-colors"
        >
          {cta}
        </a>
      </div>

      {/* Visual side */}
      <div className="flex-1 w-full">{visual}</div>
    </div>
  );
}

/* ================================================================== */
/*  FEATURE SECTION                                                    */
/* ================================================================== */
function FeatureSection() {
  return (
    <section id="features-matrix" className="bg-white py-20 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-[#071524] mb-4">
            Streamline your analysis
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Everything you need to manage, track, and optimize your links in one
            powerful platform.
          </p>
        </div>

        {/* Feature rows */}
        <div className="space-y-24 lg:space-y-32">
          {/* Row 1 — Smart Ephemeral Link Creation */}
          <FeatureRow
            id="solutions"
            badge="Link Management"
            heading="Smart Ephemeral Link Creation"
            description="Convert lengthy tracking domains into sleek, ultra-short links instantly. Secure your shares with advanced programmatic rules: define maximum usage thresholds, enforce exact expiration timelines, or deploy 'Burn-After-Reading' security parameter flags that permanently shred links right after their first click."
            items={[
              "Custom branded short domains",
              "UTM parameter builder",
              "Ephemeral self-destruction settings",
            ]}
            cta="Learn more →"
            visual={<LinkManagementCard />}
            reverse={false}
          />

          {/* Row 2 — Real-Time Metadata Insights & Previews (reversed) */}
          <FeatureRow
            badge="Analytics"
            heading="Real-Time Metadata Insights & Previews"
            description="Gain immediate performance transparency. Run granular analytical counts on inbound clicks, log incoming referral vectors, and capture viewer geographic regions on the fly. Audit and review exactly how your digital links render across target social media platforms with built-in live open-graph preview builders."
            items={[
              "Click tracking & scan analytics",
              "Geographic & device breakdown",
              "Live social media OG preview builder",
            ]}
            cta="Explore analytics →"
            visual={<AnalyticsCard />}
            reverse={true}
          />

          {/* Row 3 — QR Codes */}
          <FeatureRow
            id="resources"
            badge="QR Codes"
            heading="Dynamic QR codes that convert"
            description="Bridge offline and online connections seamlessly. Design custom, high-fidelity QR codes embedded with your brand colors and corner layouts. Edit destination endpoints on the fly without changing printed codes."
            items={[
              "Fully customizable designs",
              "Dynamic destination updates",
              "Scan tracking & analytics",
            ]}
            cta="Create QR code →"
            visual={<QRCodeCard />}
            reverse={false}
          />
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  FOOTER                                                             */
/* ================================================================== */
const footerLinks = {
  Company: ["About", "Careers", "Blog", "Press"],
  Product: ["Features", "Pricing", "API", "Integrations"],
  Resources: ["Documentation", "Guides", "Help Center", "Status"],
  Legal: ["Privacy", "Terms", "Cookie Policy", "GDPR"],
};

function Footer() {
  return (
    <footer className="bg-[#071524] text-white">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-5 text-white">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/60 hover:text-white text-sm transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <a href="#" className="text-xl font-bold text-white tracking-tight">
            Shortly
          </a>

          {/* Copyright */}
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Shortly. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {[
              { Icon: Share2, label: "Twitter" },
              { Icon: Code2, label: "GitHub" },
              { Icon: Globe, label: "LinkedIn" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/15 transition-colors duration-200"
              >
                <Icon className="w-4 h-4 text-white/60 hover:text-white transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */
export { Footer };
export default FeatureSection;
