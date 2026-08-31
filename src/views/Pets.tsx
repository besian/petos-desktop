import { useNavigate } from 'react-router-dom';
import { st } from '../lib/st';
import { useDB } from '../db/store';
import { usePageHeader } from '../ui/pageHeader';
import { ImageSlot } from '../components/ImageSlot';
import { PlusIcon } from '../components/icons';

export function Pets() {
  const navigate = useNavigate();
  const { db } = useDB();

  const clientById = new Map(db.clients.map((c) => [c.id, c]));
  usePageHeader('Pets', `${db.pets.length} pets across ${db.clients.length} clients`);

  return (
    <div style={st('animation:vIn .3s var(--ease-out)')}>
      <div style={st('display:flex;justify-content:flex-end;margin-bottom:14px')}>
        <button onClick={() => navigate('/pets/new')} style={st('display:inline-flex;align-items:center;gap:7px;border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:13px;font-weight:600;padding:9px 15px;border-radius:10px;cursor:pointer;box-shadow:var(--shadow-ring-primary)')}>
          <PlusIcon size={15} />Add pet
        </button>
      </div>
      <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
        <div style={st('display:grid;grid-template-columns:2fr 1.4fr 1fr 1fr 0.9fr;padding:13px 20px;border-bottom:1px solid var(--border-subtle);font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--fg-quaternary)')}>
          <span>Pet</span><span>Owner</span><span>Plan</span><span>Breed</span><span style={st('text-align:right')}>Age</span>
        </div>
        {db.pets.length === 0 ? (
          <div style={st('padding:40px;text-align:center;font-size:13.5px;color:var(--fg-tertiary)')}>No pets yet — add your first one.</div>
        ) : db.pets.map((pet) => {
          const owner = clientById.get(pet.clientId);
          return (
            <button
              key={pet.id}
              onClick={() => navigate(`/clients/${pet.clientId}`)}
              style={st('display:grid;grid-template-columns:2fr 1.4fr 1fr 1fr 0.9fr;align-items:center;padding:12px 20px;border-bottom:1px solid var(--border-subtle);background:transparent;border-left:none;border-right:none;border-top:none;cursor:pointer;font-family:inherit;text-align:left;width:100%')}
            >
              <span style={st('display:flex;align-items:center;gap:12px;min-width:0')}>
                <span style={{ ...st('width:40px;height:40px;border-radius:12px;overflow:hidden;flex:none;position:relative;display:block'), background: pet.color }}>
                  <ImageSlot shape="rect" fit="cover" src={pet.photo} placeholder={pet.name[0]} />
                </span>
                <span style={st('min-width:0')}>
                  <span style={st('display:flex;align-items:center;gap:6px')}>
                    <span style={st('font-size:14px;font-weight:600;color:var(--fg-primary)')}>{pet.name}</span>
                    {pet.alert ? <span style={st('font-size:10px;font-weight:700;color:var(--color-warning-700);background:var(--color-warning-50);padding:1px 7px;border-radius:999px')}>{pet.alert}</span> : null}
                  </span>
                  <span style={st('display:block;font-size:12px;color:var(--fg-tertiary)')}>{pet.breed}</span>
                </span>
              </span>
              <span style={st('font-size:13.5px;color:var(--fg-secondary)')}>{owner?.name || '—'}</span>
              <span style={st('font-size:13px;color:var(--fg-secondary)')}>{pet.plan}</span>
              <span style={st('font-size:13px;color:var(--fg-secondary)')}>{pet.breed}</span>
              <span style={st('font-size:14px;font-weight:700;color:var(--fg-primary);text-align:right')}>{pet.ageYears ? `${pet.ageYears}y` : '—'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
