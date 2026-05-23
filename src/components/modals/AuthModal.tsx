import { FormEvent, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Modal } from '../common/Modal';

export function AuthModal() {
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const signInWithEmail = useAppStore((state) => state.signInWithEmail);
  const signUpWithEmail = useAppStore((state) => state.signUpWithEmail);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email.trim(), password);
        closeModal();
        return;
      }

      const needsConfirmation = await signUpWithEmail(email.trim(), password);
      if (needsConfirmation) {
        setMessage('请先在邮箱中确认注册，然后再登录。');
        return;
      }
      closeModal();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '登录服务暂时不可用。');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={mode === 'signin' ? '邮箱登录' : '邮箱注册'} open={activeModal === 'auth'} onClose={closeModal}>
      <form className="modal-body auth-form" onSubmit={handleSubmit}>
        <div className="auth-mode-switch">
          <button className={mode === 'signin' ? 'active' : ''} type="button" onClick={() => setMode('signin')}>
            登录
          </button>
          <button className={mode === 'signup' ? 'active' : ''} type="button" onClick={() => setMode('signup')}>
            注册
          </button>
        </div>
        <label className="field">
          <span>邮箱</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
        </label>
        <label className="field">
          <span>密码</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            minLength={6}
            required
          />
        </label>
        {message && <p className="auth-message">{message}</p>}
        <button className="primary-button" type="submit" disabled={busy}>
          {busy ? '处理中...' : mode === 'signin' ? '登录' : '创建账号'}
        </button>
      </form>
    </Modal>
  );
}
