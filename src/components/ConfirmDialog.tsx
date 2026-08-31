import { st } from '../lib/st';
import { WarningIcon } from './icons';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel = 'Confirm', danger = true, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div style={st('position:fixed;inset:0;z-index:100;background:rgba(6,10,9,.55);display:flex;align-items:center;justify-content:center;animation:vIn .15s var(--ease-out)')} onClick={onCancel}>
      <div
        style={st('width:400px;max-width:calc(100% - 48px);background:var(--bg-app);border-radius:18px;border:1px solid var(--border-default);box-shadow:0 30px 80px -30px rgba(0,0,0,.5);padding:22px')}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={st(`width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;${danger ? 'background:var(--color-error-50);color:var(--color-error-700)' : 'background:var(--bg-brand-subtle);color:var(--fg-brand)'}`)}>
          <WarningIcon size={19} />
        </div>
        <div style={st('font-size:16px;font-weight:700;color:var(--fg-primary);margin-bottom:6px')}>{title}</div>
        <div style={st('font-size:13.5px;line-height:20px;color:var(--fg-secondary);margin-bottom:20px')}>{message}</div>
        <div style={st('display:flex;gap:10px;justify-content:flex-end')}>
          <button onClick={onCancel} style={st('border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13.5px;font-weight:600;padding:9px 15px;border-radius:10px;cursor:pointer')}>Cancel</button>
          <button
            onClick={onConfirm}
            style={st(danger
              ? 'border:none;background:var(--color-error-500);color:#fff;font-family:inherit;font-size:13.5px;font-weight:600;padding:9px 15px;border-radius:10px;cursor:pointer'
              : 'border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:13.5px;font-weight:600;padding:9px 15px;border-radius:10px;cursor:pointer')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
