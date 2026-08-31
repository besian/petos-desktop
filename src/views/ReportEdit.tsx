import { useNavigate, useParams } from 'react-router-dom';
import { st } from '../lib/st';
import { useDB } from '../db/store';
import { useUI } from '../ui/store';
import { usePageHeader } from '../ui/pageHeader';
import type { Report } from '../db/types';
import { ChevronLeftIcon } from '../components/icons';
import { ImageSlot } from '../components/ImageSlot';
import { btnSecondary } from '../components/Modal';

const rTogOn = 'width:38px;height:22px;border-radius:99px;background:var(--brand-primary);display:inline-flex;align-items:center;padding:2px;flex:none';
const rTogOff = 'width:38px;height:22px;border-radius:99px;background:var(--bg-tertiary);display:inline-flex;align-items:center;padding:2px;flex:none';
const rKnob = 'width:18px;height:18px;border-radius:99px;background:#fff';

const toneDefs: ['warm' | 'brief' | 'detailed', string][] = [['warm', 'Warm & chatty'], ['brief', 'Brief & factual'], ['detailed', 'Detailed']];
const includeDefs: [keyof Report['include'], string, string][] = [
  ['photos', 'Photos', '3 photos from the walk'],
  ['map', 'Route map', 'GPS track'],
  ['behaviour', 'Behaviour notes', 'Greetings, play and mood'],
  ['water', 'Water & toilet breaks', 'Logged during the walk'],
];

export function ReportEdit() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { db, updateReport, sendReport } = useDB();
  const { actions } = useUI();

  const rd = db.reports.find((r) => r.id === reportId);
  const pet = rd ? db.pets.find((p) => p.id === rd.petId) : null;
  const owner = pet ? db.clients.find((c) => c.id === pet.clientId) : null;

  usePageHeader('Edit report', 'Adjust the AI draft before sending');

  if (!rd || !pet) {
    return (
      <div style={st('text-align:center;padding:60px 0')}>
        <div style={st('font-size:15px;color:var(--fg-tertiary);margin-bottom:14px')}>This report no longer exists.</div>
        <button onClick={() => navigate('/reports')} style={st(btnSecondary)}>Back to reports</button>
      </div>
    );
  }

  const setTone = (k: 'warm' | 'brief' | 'detailed') => {
    const text = (rd.tones && rd.tones[k]) || rd.summary;
    updateReport(rd.id, { summary: text });
  };

  return (
    <div style={st('animation:vIn .3s var(--ease-out);max-width:680px;margin:0 auto')}>
      <div style={st('display:flex;align-items:center;gap:10px;margin-bottom:18px')}>
        <button onClick={() => navigate(-1)} style={st('display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 13px;border-radius:10px;cursor:pointer')}>
          <ChevronLeftIcon />Back
        </button>
        <div style={st('flex:1')} />
        <button onClick={() => { actions.showToast('Draft saved'); navigate(`/reports/${rd.id}`); }} style={st('border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:8px 14px;border-radius:10px;cursor:pointer')}>Save draft</button>
        <button onClick={() => { sendReport(rd.id); actions.showToast('Report sent to owner'); navigate('/reports'); }} style={st('border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:13px;font-weight:600;padding:9px 16px;border-radius:10px;cursor:pointer;box-shadow:var(--shadow-ring-primary)')}>Save &amp; send</button>
      </div>

      <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:22px 24px;display:flex;flex-direction:column;gap:22px')}>
        <div style={st('display:flex;align-items:center;gap:13px')}>
          <div style={{ ...st('width:44px;height:44px;border-radius:13px;overflow:hidden;flex:none'), background: pet.color }}>
            <ImageSlot shape="rect" fit="cover" src={pet.photo} placeholder={pet.name[0]} />
          </div>
          <div>
            <div style={st('font-size:16px;font-weight:700;color:var(--fg-primary)')}>{pet.name} · {rd.route}</div>
            <div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{owner?.name || '—'} · {rd.when}</div>
          </div>
        </div>

        {rd.tones ? (
          <div>
            <div style={st('font-size:12.5px;font-weight:700;color:var(--fg-primary);margin-bottom:9px')}>Tone</div>
            <div style={st('display:flex;gap:8px')}>
              {toneDefs.map(([k, label]) => {
                const on = rd.summary === rd.tones?.[k];
                return (
                  <button
                    key={k}
                    onClick={() => setTone(k)}
                    style={st(`flex:1;padding:9px 6px;border-radius:10px;border:1px solid ${on ? 'transparent' : 'var(--border-subtle)'};background:${on ? 'var(--brand-primary)' : 'var(--bg-primary)'};color:${on ? 'var(--brand-on-primary)' : 'var(--fg-secondary)'};font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer`)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div>
          <div style={st('display:flex;align-items:center;justify-content:space-between;margin-bottom:9px')}>
            <div style={st('font-size:12.5px;font-weight:700;color:var(--fg-primary)')}>Summary</div>
            <span style={st('font-size:11.5px;color:var(--fg-quaternary)')}>Editable — this is what the owner reads</span>
          </div>
          <textarea
            value={rd.summary}
            onChange={(e) => updateReport(rd.id, { summary: e.target.value })}
            style={st('width:100%;box-sizing:border-box;min-height:150px;resize:vertical;border:1px solid var(--border-default);border-radius:12px;padding:13px 15px;font-family:inherit;font-size:14px;line-height:21px;color:var(--fg-primary);background:var(--bg-primary);outline:none')}
          />
        </div>

        <div>
          <div style={st('font-size:12.5px;font-weight:700;color:var(--fg-primary);margin-bottom:9px')}>Include in report</div>
          <div style={st('display:flex;flex-direction:column;gap:2px')}>
            {includeDefs.map(([key, label, hint]) => {
              const on = rd.include[key];
              return (
                <div key={key} style={st('display:flex;align-items:center;gap:13px;padding:11px 2px;border-bottom:1px solid var(--border-subtle)')}>
                  <div style={st('flex:1')}>
                    <div style={st('font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>{label}</div>
                    <div style={st('font-size:12px;color:var(--fg-tertiary)')}>{hint}</div>
                  </div>
                  <button onClick={() => updateReport(rd.id, { include: { ...rd.include, [key]: !on } })} style={{ ...st(on ? rTogOn : rTogOff), border: 'none', cursor: 'pointer' }}>
                    <span style={st(on ? rKnob + ';margin-left:auto' : rKnob)} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {rd.include.photos ? (
          <div>
            <div style={st('font-size:12.5px;font-weight:700;color:var(--fg-primary);margin-bottom:9px')}>Photos</div>
            <div style={st('display:grid;grid-template-columns:repeat(3,1fr);gap:10px')}>
              {[0, 1, 2].map((n) => (
                <div key={n} style={st('aspect-ratio:4/3;border-radius:12px;overflow:hidden;position:relative')}>
                  <ImageSlot shape="rect" fit="cover" src={rd.photos?.[n]} placeholder="Tap to replace" />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
