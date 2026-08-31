import { useUI } from '../ui/store';
import { CheckIcon } from './icons';

export function Toast() {
  const { state } = useUI();
  if (!state.toast) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--fg-primary)',
        color: 'var(--bg-primary)',
        fontSize: '13.5px',
        fontWeight: 600,
        padding: '12px 20px',
        borderRadius: '999px',
        boxShadow: '0 10px 30px rgba(0,0,0,.3)',
        zIndex: 80,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        animation: 'toastD .2s var(--ease-out)',
      }}
    >
      <CheckIcon size={15} />
      {state.toast}
    </div>
  );
}
