import { Outlet } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { DestinationModal } from '../modals/DestinationModal';
import { PetSelectModal } from '../modals/PetSelectModal';
import { PreferenceModal } from '../modals/PreferenceModal';
import { TravelSummaryModal } from '../modals/TravelSummaryModal';
import { WorldTypeModal } from '../modals/WorldTypeModal';

export function AppLayout() {
  const openModal = useAppStore((state) => state.openModal);
  const setPreferenceSaveTarget = useAppStore((state) => state.setPreferenceSaveTarget);

  return (
    <div className="app-shell">
      {/* UI-only shell: navigation opens existing modals and must not replace route/service logic. */}
      <header className="app-header">
        <div className="brand-mark" aria-label="替我去看世界">
          <span className="brand-orbit">✦</span>
          <div>
            <h1>替我去看世界</h1>
            <p>AI Travel Companion</p>
          </div>
        </div>
        <nav className="app-nav" aria-label="首页导航">
          <button type="button" className="nav-link active">
            首页
          </button>
          <button type="button" className="nav-link" onClick={() => openModal('petSelect')}>
            我的宠物
          </button>
          <button
            type="button"
            className="nav-link"
            onClick={() => {
              setPreferenceSaveTarget('close');
              openModal('preference');
            }}
          >
            偏好记忆
          </button>
          <span className="nav-link ghost">旅行足迹</span>
        </nav>
        <div className="header-actions">
          <button type="button" className="signin-button">
            Demo 用户
          </button>
          <button type="button" className="icon-button" aria-label="设置">
            ⚙
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <PetSelectModal />
      <PreferenceModal />
      <WorldTypeModal />
      <DestinationModal />
      <TravelSummaryModal />
    </div>
  );
}
