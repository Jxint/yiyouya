import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { DiaryList } from '../travel/DiaryList';
import { Modal } from '../common/Modal';

export function TravelSummaryModal() {
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const record = useAppStore((state) => state.latestEndedRecord);

  if (!record) return null;

  return (
    <Modal title="本次旅行图文游记" open={activeModal === 'travelSummary'} onClose={closeModal}>
      <div className="modal-body">
        <section className="summary-window-header">
          <h3>{record.destination.name}</h3>
          <p>{record.destination.description}</p>
        </section>
        <DiaryList entries={record.diaryEntries} />
        <div className="modal-actions">
          <button type="button" onClick={closeModal}>
            关闭
          </button>
          <Link className="button-link" to={`/travel/${record.id}`} onClick={closeModal}>
            查看完整记录
          </Link>
        </div>
      </div>
    </Modal>
  );
}
