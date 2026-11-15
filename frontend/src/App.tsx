import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { Home } from './pages/Home.js';
import { ScanPage } from './pages/ScanPage.js';
import { StudySession } from './pages/StudySession.js';
import { ReviewPage } from './pages/ReviewPage.js';
import { UnitsPage } from './pages/UnitsPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { GamesPage } from './pages/GamesPage.js';
import { ExamSimulatorPage } from './pages/ExamSimulatorPage.js';
import { EncyclopediaPage } from './pages/EncyclopediaPage.js';
import { WorksheetPage } from './pages/WorksheetPage.js';
import { PinModal } from './components/PinModal.js';
import { UserSwitcherModal } from './components/UserSwitcherModal.js';
import { VersionBadge } from './components/VersionBadge.js';
import { fetchProfile, syncOfflineProgress } from './services/api.js';
import { UserProfile, ExerciseSet } from './types.js';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeUnit, setActiveUnit] = useState<{ id?: string; set: ExerciseSet } | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

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
          onGamesClick={() => handleNavigate('games')}
          onExamClick={() => handleNavigate('exam')}
          onEncyclopediaClick={() => handleNavigate('encyclopedia')}
          onWorksheetClick={() => handleNavigate('worksheet')}
          onSettingsClick={handleSettingsClick}
          onMyUnitsClick={() => handleNavigate('units')}
          onUserClick={() => setIsUserModalOpen(true)}
        />

        <main className="pb-12">
          {currentPage === 'home' && (
            <Home
              profile={profile}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'games' && (
            <GamesPage
              profile={profile}
              onBack={() => handleNavigate('home')}
              onStarsUpdated={(newStars) => {
                if (profile) setProfile({ ...profile, stars: newStars });
              }}
            />
          )}

          {currentPage === 'exam' && (
            <ExamSimulatorPage
              profile={profile}
              onBack={() => handleNavigate('home')}
              onStarsUpdated={(newStars) => {
                if (profile) setProfile({ ...profile, stars: newStars });
              }}
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
              onOpenEncyclopedia={() => handleNavigate('encyclopedia')}
              onOpenWorksheets={() => handleNavigate('worksheet')}
              onSelectUnit={(unitId, set) => handleNavigate('study', { unitId, set })}
            />
          )}

          {currentPage === 'worksheet' && (
            <WorksheetPage
              onBack={() => handleNavigate('home')}
            />
          )}

          {currentPage === 'encyclopedia' && (
            <EncyclopediaPage
              mascotType={profile?.mascot}
              onBack={() => handleNavigate('home')}
              onUnitCreated={(unitId, set) => handleNavigate('study', { unitId, set })}
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
      <footer className="text-center py-4 text-xs font-bold text-slate-400 border-t border-slate-100 flex items-center justify-center gap-2">
        <span>Mi Cuaderno Mágico para iPad • Diseñado para aprender jugando ✨</span>
        <VersionBadge variant="footer" />
      </footer>

      {/* Modal de PIN para adultos */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
      />

      {/* Modal de selección de estudiante */}
      <UserSwitcherModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onUserSelected={() => {
          loadProfile();
          setCurrentPage('home');
        }}
      />
    </div>
  );
};

export default App;
