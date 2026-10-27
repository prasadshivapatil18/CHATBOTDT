import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { AdminDashboard } from './components/AdminDashboard';
import { HeroShowcase } from './components/3d/HeroShowcase';
import { ReturnModal } from './components/ReturnModal';
import { api } from './services/api';

export function App() {
  const [currentView, setCurrentView] = useState<'chat' | 'admin'>('chat');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isHumanModalOpen, setIsHumanModalOpen] = useState<boolean>(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState<boolean>(false);
  const [chatResetKey, setChatResetKey] = useState<number>(0);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  useEffect(() => {
    // Check backend health and demo mode state
    api.checkHealth()
      .then((data) => {
        setIsDemoMode(Boolean(data.demo_mode));
      })
      .catch((err) => {
        console.warn('Backend health check warning:', err);
      });
  }, []);

  const handleClearChat = () => {
    if (confirm('Start a fresh customer support conversation?')) {
      setChatResetKey((k) => k + 1);
      setPendingPrompt(null);
    }
  };

  const handleStartChatFromHero = (samplePrompt?: string) => {
    if (samplePrompt) {
      setPendingPrompt(samplePrompt);
    }
    const chatEl = document.getElementById('chat-section');
    if (chatEl) {
      chatEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#171717] flex flex-col font-body selection:bg-[#FFE156]">
      {/* Neo-Brutalist Navigation Header */}
      <Header
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        onClearChat={handleClearChat}
        onOpenHumanModal={() => setIsHumanModalOpen(true)}
        isDemoMode={isDemoMode}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {currentView === 'chat' ? (
          <div className="flex-1 flex flex-col">
            {/* 3D Astra Assistant Hero Showcase with GSAP ScrollTrigger */}
            <HeroShowcase
              onStartChat={handleStartChatFromHero}
              onOpenReturns={() => setIsReturnModalOpen(true)}
              assistantState="idle"
            />

            {/* Core Interactive Chat Experience with Docked 3D Companion */}
            <div className="py-6">
              <ChatInterface
                key={chatResetKey}
                onOpenHumanModal={() => setIsHumanModalOpen(true)}
                isHumanModalOpen={isHumanModalOpen}
                onCloseHumanModal={() => setIsHumanModalOpen(false)}
                initialPrompt={pendingPrompt}
                onPromptHandled={() => setPendingPrompt(null)}
              />
            </div>
          </div>
        ) : (
          <AdminDashboard />
        )}
      </main>

      {/* Global Return Modal (callable from Hero or Header) */}
      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onReturnGenerated={(ord, retCode) => {
          setIsReturnModalOpen(false);
          handleStartChatFromHero(
            `I just submitted return request ${retCode} for order ${ord}. What are the next steps?`
          );
        }}
      />

      {/* Neo-Brutalist Footer Banner */}
      <footer className="border-t-[3px] border-[#171717] bg-[#FFE156] py-3 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-black uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#171717]"></span>
            <span>SIDEKICK AI • ASTRA 3D NEURAL CUSTOMER SUPPORT PLATFORM</span>
          </div>
          <div className="flex items-center gap-3">
            <span>FASTAPI + PYTHON 3.11+</span>
            <span>•</span>
            <span>THREE.JS & CUSTOM GLSL</span>
            <span>•</span>
            <span>GSAP SCROLLTRIGGER</span>
            <span>•</span>
            <span>NEO-BRUTALISM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
