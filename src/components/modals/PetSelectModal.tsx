import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import type { Pet } from '../../types';
import { Modal } from '../common/Modal';

const createCustomPet = (name: string): Pet => ({
  id: `pet-custom-${Date.now()}`,
  name,
  species: '自定义旅行宠物',
  personality: '由主人定义，后续可接入真实宠物生成服务。',
  avatarUrl: '/mock-images/pet-custom.png',
  referenceImageUrl: '/mock-images/pet-custom-reference.jpg',
  description: '这是一个本地 mock 的自定义宠物，真实创建接口已在 dbService 中预留。',
  source: 'custom',
});

export function PetSelectModal() {
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const selectPet = useAppStore((state) => state.selectPet);
  const addCustomPet = useAppStore((state) => state.addCustomPet);
  const openModal = useAppStore((state) => state.openModal);
  const setPreferenceSaveTarget = useAppStore((state) => state.setPreferenceSaveTarget);
  const pets = useAppStore((state) => state.pets);
  const hasPreferences = useAppStore((state) => Boolean(state.user.preferenceSummary));
  const [index, setIndex] = useState(0);
  const [customName, setCustomName] = useState('');

  const pet = pets[index] ?? pets[0];

  const goNext = () => setIndex((current) => (current + 1) % pets.length);
  const goPrev = () => setIndex((current) => (current - 1 + pets.length) % pets.length);

  const continueFlow = () => {
    setPreferenceSaveTarget('worldType');
    openModal(hasPreferences ? 'worldType' : 'preference');
  };

  const handleConfirm = () => {
    selectPet(pet);
    continueFlow();
  };

  const handleCreateCustom = async () => {
    const name = customName.trim();
    if (!name) return;
    const customPet = createCustomPet(name);
    await addCustomPet(customPet);
    setCustomName('');
    continueFlow();
  };

  return (
    <Modal title="选择你的旅行宠物" open={activeModal === 'petSelect'} onClose={closeModal}>
      <div className="modal-body">
        <div className="pet-carousel">
          <button type="button" onClick={goPrev}>
            上一个
          </button>
          <div className="pet-option">
            <img src={pet.referenceImageUrl} alt={`${pet.name} reference`} />
            <div>
              <h3>{pet.name}</h3>
              <p>{pet.species}</p>
              <p>{pet.personality}</p>
              <p>{pet.description}</p>
            </div>
          </div>
          <button type="button" onClick={goNext}>
            下一个
          </button>
        </div>
        <button className="primary-button" type="button" onClick={handleConfirm}>
          确认选择
        </button>
        <div className="custom-pet-box">
          <label className="field">
            <span>自定义宠物名称</span>
            <input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="给你的宠物起一个名字" />
          </label>
          <button type="button" onClick={handleCreateCustom} disabled={!customName.trim()}>
            创建并选择自定义宠物
          </button>
        </div>
      </div>
    </Modal>
  );
}
