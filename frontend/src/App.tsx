import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { Home } from './pages/Home.js';
import { ScanPage } from './pages/ScanPage.js';
import { StudySession } from './pages/StudySession.js';
import { ReviewPage } from './pages/ReviewPage.js';
import { UnitsPage } from './pages/UnitsPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { PinModal } from './components/PinModal.js';
import { fetchProfile, syncOfflineProgress } from './services/api.js';
import { UserProfile, ExerciseSet } from './types.js';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeUnit, setActiveUnit] = useState<{ id?: string; set: ExerciseSet } | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Cargar perfil al inicio
  const loadProfile = async () => {
    try {
      const p = await fetchProfile();
      setProfile(p);
    } catch (e) {
      console.warn('Error cargando perfil:', e);
    }
  };

  useEffect(() => {
    loadProfile();
    // Intentar sincronizar datos offline al arrancar
    syncOfflineProgress();
  }, []);

  const handleNavigate = (page: string, params?: any) => {
    if (page === 'study' && params?.set) {
      setActiveUnit({ id: params.unitId, set: params.set });
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStudySuccess = (unitId: string, set: ExerciseSet) => {
    setActiveUnit({ id: unitId, set });
    setCurrentPage('study');
    loadProfile();
  };

  const handleSessionFinish = () => {
    loadProfile();
    setCurrentPage('home');
  };

  const handleSettingsClick = () => {
    setIsPinModalOpen(true);
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setCurrentPage('settings');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Navbar
          profile={profile}
          onHomeClick={() => handleNavigate('home')}
          onSettingsClick={handleSettingsClick}
          onMyUnitsClick={() => handleNavigate('units')}
        />

        <main className="pb-12">
          {currentPage === 'home' && (
            <Home
              profile={profile}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'scan' && (
            <ScanPage
              mascotType={profile?.mascot}
              onBack={() => handleNavigate('home')}
              onSuccess={handleStudySuccess}
            />
          )}

          {currentPage === 'study' && activeUnit && (
            <StudySession
              unitId={activeUnit.id}
              exerciseSet={activeUnit.set}
              mascotType={profile?.mascot}
              sessionType="new"
              onFinish={handleSessionFinish}
            />
          )}

          {currentPage === 'review' && (
            <ReviewPage
              mascotType={profile?.mascot}
              onBack={handleSessionFinish}
            />
          )}

          {currentPage === 'units' && (
            <UnitsPage
              mascotType={profile?.mascot}
              onBack={() => handleNavigate('home')}
              onSelectUnit={(unitId, set) => handleNavigate('study', { unitId, set })}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              currentMascot={profile?.mascot || 'chispa'}
              onBack={() => handleNavigate('home')}
              onMascotChange={(newMascot) => {
                if (profile) setProfile({ ...profile, mascot: newMascot });
              }}
            />
          )}
        </main>
      </div>

      {/* Footer amable */}
      <footer className="text-center py-4 text-xs font-bold text-slate-400 border-t border-slate-100">
        Mi Cuaderno Mágico para iPad • Diseñado para aprender jugando ✨
      </footer>

      {/* Modal de PIN para adultos */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
      />
    </div>
  );
};

export default App;
