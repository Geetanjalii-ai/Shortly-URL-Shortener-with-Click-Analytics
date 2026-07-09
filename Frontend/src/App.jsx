import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import FeatureSection, { Footer } from './components/FeatureSection';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

function MainAppContent() {
  const { currentView } = useAuth();

  return (
    <div className="min-h-screen bg-navy font-sans antialiased flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {currentView === 'home' ? (
          <>
            <HeroSection />
            {/* Render preview version of the dashboard with mock data */}
            <AnalyticsDashboard forcePreview={true} />
            <FeatureSection />
          </>
        ) : (
          /* Render full-page interactive protected analytics dashboard workspace */
          <AnalyticsDashboard />
        )}
      </main>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
