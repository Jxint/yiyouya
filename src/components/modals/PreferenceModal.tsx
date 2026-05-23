import { useState } from 'react';
import { agentService } from '../../services/agentService';
import { useAppStore } from '../../store/appStore';
import { Modal } from '../common/Modal';

const preferenceTags = ['音乐', '美术', '运动', '美食', '爬山', '自然风光', '娱乐设施'];

export function PreferenceModal() {
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const openModal = useAppStore((state) => state.openModal);
  const updatePreferences = useAppStore((state) => state.updatePreferences);
  const preferenceSaveTarget = useAppStore((state) => state.preferenceSaveTarget);
  const initialText = useAppStore((state) => state.user.preferenceText ?? '');
  const initialSummary = useAppStore((state) => state.preferenceSummary);
  const [text, setText] = useState(initialText);
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(false);

  const appendTag = (tag: string) => {
    setText((current) => {
      if (current.includes(tag)) return current;
      return current.trim() ? `${current.trim()}、${tag}` : tag;
    });
  };

  const handleSummarize = async () => {
    setLoading(true);
    const nextSummary = await agentService.summarizePreferences(text);
    setSummary(nextSummary);
    setLoading(false);
  };

  const handleConfirm = async () => {
    const nextSummary = summary || (await agentService.summarizePreferences(text));
    updatePreferences(text, nextSummary);
    if (preferenceSaveTarget === 'worldType') {
      openModal('worldType');
      return;
    }
    closeModal();
  };

  return (
    <Modal title="设置旅行偏好" open={activeModal === 'preference'} onClose={closeModal}>
      <div className="modal-body">
        <div className="preference-tags">
          {preferenceTags.map((tag) => (
            <button type="button" key={tag} onClick={() => appendTag(tag)}>
              {tag}
            </button>
          ))}
        </div>
        <label className="field">
          <span>告诉宠物你喜欢怎样的旅行</span>
          <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="例如：喜欢安静街区、自然风景、慢节奏散步。" />
        </label>
        <button type="button" onClick={handleSummarize} disabled={loading}>
          {loading ? '总结中...' : '一键总结偏好'}
        </button>
        {summary && <p className="summary-box">{summary}</p>}
        <button className="primary-button" type="button" onClick={handleConfirm}>
          保存偏好
        </button>
      </div>
    </Modal>
  );
}
