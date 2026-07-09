import { useState, useEffect } from "react";
import { Link2, Menu, X, LogOut, LayoutDashboard, Home, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

const navLinks = ["Platform", "Solutions", "Analytics", "Resources"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState('login');

  const { user, logout, currentView, setCurrentView } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const openAuth = (view) => {
    setModalView(view);
    setModalOpen(true);
    setMobileOpen(false);
  };

  const handleScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 h-16 border-b border-white/5 bg-[#071524]/90 backdrop-blur-xl transition-all duration-300 ${
          scrolled ? "shadow-lg shadow-black/20" : "shadow-none"
        }`}
      >
        <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          {/* ── Logo ─────────────────────────────────────── */}
          <button 
            onClick={() => setCurrentView('home')} 
            className="flex items-center gap-2 group cursor-pointer bg-transparent border-none"
          >
            <Link2
              className="h-6 w-6 text-[#1d64ec] transition-transform duration-300 group-hover:rotate-[-20deg]"
              strokeWidth={2.5}
            />
            <span className="text-lg font-bold tracking-tight text-white">
              Shortly
            </span>
          </button>

          {/* ── Desktop nav links (center) ───────────────── */}
          {currentView === 'home' && (
            <ul className="hidden md:flex items-center gap-8">
              {navLinks.map((label) => (
                <li key={label}>
                  <a
                    href={`#${label.toLowerCase()}`}
                    onClick={(e) => handleScroll(e, label.toLowerCase())}
                    className="relative py-1 text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white
                      after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-left after:scale-x-0
                      after:rounded-full after:bg-[#1d64ec] after:transition-transform after:duration-300
                      hover:after:scale-x-100"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {currentView === 'dashboard' && (
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-white/50">
              <button 
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 hover:text-white transition cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              <span className="text-white/10">/</span>
              <span className="text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 font-semibold">
                <LayoutDashboard className="w-4 h-4 text-primary" />
                Dashboard
              </span>
            </div>
          )}

          {/* ── Desktop actions (right) ──────────────────── */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {/* Dashboard Link if currently on Home */}
                {currentView === 'home' && (
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="text-sm font-semibold text-white/80 hover:text-white flex items-center gap-1.5 cursor-pointer bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:bg-white/10 transition"
                  >
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    Go to Dashboard
                  </button>
                )}

                {/* Profile Avatar */}
                <div className="flex items-center gap-2.5 bg-white/5 pl-2.5 pr-4 py-1.5 rounded-full border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-white/80">{user.username}</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-rose-400 transition cursor-pointer bg-transparent border-none"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => openAuth('login')}
                  className="text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white cursor-pointer bg-transparent border-none"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuth('signup')}
                  className="inline-flex items-center rounded-full bg-[#1d64ec] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#1d64ec]/25 transition-all duration-200 hover:bg-[#1550c8] hover:shadow-lg hover:shadow-[#1d64ec]/30 active:scale-[0.97] cursor-pointer"
                >
                  Sign Up Free
                </button>
              </>
            )}
          </div>

          {/* ── Mobile hamburger toggle ──────────────────── */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="relative z-50 flex md:hidden items-center justify-center rounded-lg p-2 text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          >
            <span
              className={`absolute transition-all duration-300 ${
                mobileOpen ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
              }`}
            >
              <X className="h-5 w-5" />
            </span>
            <span
              className={`transition-all duration-300 ${
                mobileOpen ? "-rotate-90 opacity-0" : "rotate-0 opacity-100"
              }`}
            >
              <Menu className="h-5 w-5" />
            </span>
          </button>
        </nav>

        {/* ── Mobile dropdown ────────────────────────────── */}
        <div
          className={`absolute inset-x-0 top-16 border-b border-white/5 bg-[#071524]/95 backdrop-blur-2xl transition-all duration-300 md:hidden ${
            mobileOpen
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-3 opacity-0"
          }`}
        >
          <div className="mx-auto max-w-7xl space-y-1 px-6 py-4">
            {user ? (
              <div className="space-y-2 py-2">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.username}</p>
                    <p className="text-xs text-white/40">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCurrentView('home');
                    setMobileOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>

                <button
                  onClick={() => {
                    setCurrentView('dashboard');
                    setMobileOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
                >
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                  Dashboard
                </button>

                <div className="my-2 h-px bg-white/10" />

                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            ) : (
              <>
                {navLinks.map((label, i) => (
                  <a
                    key={label}
                    href={`#${label.toLowerCase()}`}
                    onClick={(e) => {
                      setMobileOpen(false);
                      handleScroll(e, label.toLowerCase());
                    }}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors duration-200 hover:bg-white/5 hover:text-white"
                    style={{ transitionDelay: `${i * 50}ms` }}
                  >
                    {label}
                  </a>
                ))}

                <div className="my-3 h-px bg-white/10" />

                <button
                  onClick={() => openAuth('login')}
                  className="w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white cursor-pointer bg-transparent border-none"
                >
                  Log In
                </button>

                <button
                  onClick={() => openAuth('signup')}
                  className="mt-2 block w-full rounded-full bg-[#1d64ec] px-5 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-[#1d64ec]/25 transition-all duration-200 hover:bg-[#1550c8] active:scale-[0.97]"
                >
                  Sign Up Free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        initialView={modalView}
      />
    </>
  );
}
