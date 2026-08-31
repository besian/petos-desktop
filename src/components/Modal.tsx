import type { ReactNode } from 'react';
import { st } from '../lib/st';
import { CloseIcon } from './icons';

interface ModalProps {
  title: string;
  sub?: string;
  width?: number;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ title, sub, width = 480, onClose, children, footer }: ModalProps) {
  return (
    <div style={st('position:fixed;inset:0;z-index:90;background:rgba(6,10,9,.55);display:flex;align-items:center;justify-content:center;animation:vIn .2s var(--ease-out)')} onClick={onClose}>
      <div
        style={{ ...st('max-width:calc(100% - 48px);background:var(--bg-app);border-radius:20px;border:1px solid var(--border-default);box-shadow:0 30px 80px -30px rgba(0,0,0,.5);overflow:hidden;max-height:calc(100vh - 64px);display:flex;flex-direction:column'), width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={st('padding:20px 24px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border-subtle);flex:none')}>
          <div style={st('flex:1')}>
            <div style={st('font-size:19px;font-weight:700;color:var(--fg-primary);letter-spacing:-.01em')}>{title}</div>
            {sub ? <div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{sub}</div> : null}
          </div>
          <button onClick={onClose} style={st('width:34px;height:34px;border-radius:999px;border:none;background:var(--bg-tertiary);color:var(--fg-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;flex:none')}>
            <CloseIcon />
          </button>
        </div>
        <div className="ps" style={st('padding:20px 24px;overflow-y:auto')}>{children}</div>
        {footer ? <div style={st('padding:14px 24px;border-top:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;justify-content:flex-end;flex:none')}>{footer}</div> : null}
      </div>
    </div>
  );
}

export const fieldLabel = 'display:block;font-size:12.5px;font-weight:700;color:var(--fg-primary);margin-bottom:7px';
export const fieldInput = 'width:100%;box-sizing:border-box;border:1px solid var(--border-default);border-radius:10px;padding:10px 13px;font-family:inherit;font-size:13.5px;color:var(--fg-primary);background:var(--bg-primary);outline:none';
export const fieldWrap = 'margin-bottom:14px';
export const btnPrimary = 'border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:13.5px;font-weight:600;padding:10px 18px;border-radius:10px;cursor:pointer;box-shadow:var(--shadow-ring-primary)';
export const btnSecondary = 'border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13.5px;font-weight:600;padding:10px 16px;border-radius:10px;cursor:pointer';
