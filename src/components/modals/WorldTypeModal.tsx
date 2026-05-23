import { useAppStore } from '../../store/appStore';
import type { WorldType } from '../../types';
import { Modal } from '../common/Modal';

const worldOptions: Array<{ type: WorldType; title: string; description: string }> = [
  { type: 'real', title: '现实世界', description: '从真实城市、自然风景和现实旅行目的地中选择。' },
  { type: 'fantasy', title: '异世界', description: '进入虚构地点，让宠物替你探索不存在于地图上的地方。' },
  { type: 'random', title: '随机世界', description: '不提前揭晓世界类型，交给系统纯随机出发。' },
];

export function WorldTypeModal() {
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const openModal = useAppStore((state) => state.openModal);
  const selectedWorldType = useAppStore((state) => state.selectedWorldType);
  const setSelectedWorldType = useAppStore((state) => state.setSelectedWorldType);

  const handleNext = () => {
    if (selectedWorldType) {
      openModal('destination');
    }
  };

  return (
    <Modal title="选择旅行世界" open={activeModal === 'worldType'} onClose={closeModal}>
      <div className="modal-body">
        <div className="world-type-grid">
          {worldOptions.map((option) => (
            <button
              className={`world-type-card ${selectedWorldType === option.type ? 'selected' : ''}`}
              type="button"
              key={option.type}
              onClick={() => setSelectedWorldType(option.type)}
            >
              <strong>{option.title}</strong>
              <span>{option.description}</span>
            </button>
          ))}
        </div>
        <button className="primary-button" type="button" onClick={handleNext} disabled={!selectedWorldType}>
          继续选择目的地
        </button>
      </div>
    </Modal>
  );
}
