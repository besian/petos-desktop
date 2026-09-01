import { useMemo, useState, type FormEvent } from 'react';
import { st } from '../lib/st';
import { useUI } from '../ui/store';
import { useDB } from '../db/store';
import { askCopilot } from '../lib/copilot';
import { resolveAction } from '../lib/copilotActions';
import { CloseIcon, SparkleIcon, SendIcon } from './icons';
import { btnPrimary, btnSecondary } from './Modal';

const chips = ['Who hasn’t paid?', 'Dogs with medication?', 'Space next Thursday?'];

export function CopilotPanel() {
  const { state, actions } = useUI();
  const dbCtx = useDB();
  const { db } = dbCtx;
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const resolution = useMemo(
    () => (state.copilotPendingAction ? resolveAction(state.copilotPendingAction, dbCtx) : null),
    [state.copilotPendingAction, dbCtx],
  );

  if (!state.copilotOpen) return null;

  const ask = async (question: string) => {
    if (!question.trim() || thinking) return;
    actions.pushCopilotUser(question);
    setDraft('');
    setThinking(true);
    try {
      const a = await askCopilot(db, question);
      actions.pushCopilotAI(a.text, a.rows, a.action);
    } catch {
      actions.pushCopilotAI("I couldn't reach Copilot just now — please try again in a moment.", null, null);
    } finally {
      setThinking(false);
    }
  };

  const confirmAction = async () => {
    if (!resolution || !resolution.ok) return;
    setConfirming(true);
    try {
      const msg = await resolution.execute();
      actions.pushCopilotAI(msg, null, null);
      actions.showToast(msg);
    } catch {
      actions.pushCopilotAI("Something went wrong and I couldn't complete that — please try again.", null, null);
    } finally {
      setConfirming(false);
    }
  };

  const cancelAction = () => {
    actions.clearPendingAction();
    actions.pushCopilotAI('No problem — cancelled.', null, null);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(draft);
  };

  return (
    <div style={st('width:340px;flex:none;border-left:1px solid var(--border-subtle);background:var(--bg-primary);display:flex;flex-direction:column')}>
      <div style={st('padding:18px 18px 14px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px')}>
        <div style={st('width:32px;height:32px;border-radius:10px;background:var(--bg-brand-subtle);color:var(--fg-brand);display:flex;align-items:center;justify-content:center')}>
          <SparkleIcon size={18} />
        </div>
        <div style={st('flex:1')}>
          <div style={st('font-size:14.5px;font-weight:700;color:var(--fg-primary)')}>Copilot</div>
          <div style={st('font-size:11.5px;color:var(--fg-tertiary)')}>Ask about your business</div>
        </div>
        <button onClick={actions.toggleCopilot} style={st('background:transparent;border:none;color:var(--fg-tertiary);cursor:pointer;padding:4px')}>
          <CloseIcon />
        </button>
      </div>
      <div className="ps" style={st('flex:1;overflow-y:auto;padding:16px 16px 8px;display:flex;flex-direction:column;gap:12px')}>
        {state.copilotThread.map((m, i) => (
          <div key={i} style={st(m.role === 'user' ? 'display:flex;justify-content:flex-end' : 'display:flex;justify-content:flex-start')}>
            <div style={st(m.role === 'user'
              ? 'max-width:84%;background:var(--brand-primary);color:var(--brand-on-primary);border-radius:14px 14px 4px 14px;padding:10px 13px;font-size:13.5px;line-height:19px;font-weight:500'
              : 'max-width:88%;background:var(--bg-tertiary);color:var(--fg-primary);border-radius:14px 14px 14px 4px;padding:10px 13px;font-size:13.5px;line-height:19px')}
            >
              {m.text}
            </div>
          </div>
        ))}
        {thinking ? (
          <div style={st('display:flex;justify-content:flex-start')}>
            <div style={st('background:var(--bg-tertiary);border-radius:14px 14px 14px 4px;padding:10px 13px;display:flex;gap:4px;align-items:center')}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ ...st('width:5px;height:5px;border-radius:99px;background:var(--fg-tertiary);animation:copilotDot 1.1s ease-in-out infinite'), animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        ) : null}
        {state.copilotResult ? (
          <div style={st('background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:14px;padding:6px')}>
            {state.copilotResult.map((r, i) => (
              <div key={i} style={st('display:flex;align-items:center;gap:11px;padding:9px 10px')}>
                <span style={st(`width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#fff;flex:none;background:${r.color}`)}>{r.initial}</span>
                <div style={st('flex:1;min-width:0')}>
                  <div style={st('font-size:13px;font-weight:600;color:var(--fg-primary)')}>{r.name}</div>
                  <div style={st('font-size:11.5px;color:var(--fg-tertiary)')}>{r.sub}</div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {state.copilotPendingAction && resolution ? (
          <div style={st('background:var(--bg-brand-subtle);border:1px solid var(--border-brand);border-radius:14px;padding:13px')}>
            {resolution.ok ? (
              <>
                <div style={st('font-size:13px;color:var(--fg-primary);font-weight:600;line-height:18px;margin-bottom:12px')}>{state.copilotPendingAction.summary}</div>
                <div style={st('display:flex;gap:8px')}>
                  <button
                    onClick={confirmAction}
                    disabled={confirming}
                    style={st(`${btnPrimary};flex:1;padding:8px 10px;font-size:12.5px;text-align:center${confirming ? ';opacity:.65' : ''}`)}
                  >
                    {confirming ? 'Working…' : 'Confirm'}
                  </button>
                  <button onClick={cancelAction} disabled={confirming} style={st(`${btnSecondary};flex:1;padding:8px 10px;font-size:12.5px;text-align:center`)}>Cancel</button>
                </div>
              </>
            ) : (
              <div style={st('font-size:12.5px;color:var(--fg-secondary);line-height:18px')}>{resolution.error}</div>
            )}
          </div>
        ) : null}
      </div>
      <div style={st('padding:10px 14px 16px;border-top:1px solid var(--border-subtle)')}>
        <div className="ps" style={st('display:flex;gap:7px;overflow-x:auto;padding-bottom:9px')}>
          {chips.map((label) => (
            <button
              key={label}
              onClick={() => ask(label)}
              disabled={thinking}
              style={st(`flex:none;white-space:nowrap;font-size:12px;font-weight:600;color:var(--fg-secondary);background:var(--bg-tertiary);border:1px solid var(--border-subtle);border-radius:999px;padding:7px 12px;cursor:pointer;font-family:inherit;${thinking ? 'opacity:.5' : ''}`)}
            >
              {label}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} style={st('display:flex;align-items:center;gap:8px;background:var(--bg-tertiary);border-radius:12px;padding:6px 6px 6px 14px')}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask anything…"
            disabled={thinking}
            style={st('flex:1;min-width:0;border:none;background:transparent;outline:none;font-family:inherit;font-size:13px;color:var(--fg-primary)')}
          />
          <button
            type="submit"
            disabled={thinking}
            style={st(`width:34px;height:34px;border-radius:9px;border:none;background:var(--brand-primary);color:var(--brand-on-primary);display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none;${thinking ? 'opacity:.5' : ''}`)}
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
}
