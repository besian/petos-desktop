import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { st } from '../lib/st';
import { useAuth } from '../auth/store';
import { PawIcon } from '../components/icons';

export function PortalLogin() {
  const { portalLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await portalLogin({ email, password });
    setSubmitting(false);
    if (!res.ok) { setError(res.error || 'Could not log in.'); return; }
    navigate('/portal', { replace: true });
  }

  return (
    <div style={st('min-height:100vh;width:100%;display:flex;align-items:center;justify-content:center;background:var(--bg-secondary);padding:20px;box-sizing:border-box')}>
      <div style={st('width:100%;max-width:380px')}>
        <div style={st('display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:28px')}>
          <div style={st('width:38px;height:38px;border-radius:11px;background:var(--brand-primary);display:flex;align-items:center;justify-content:center;color:#fff')}><PawIcon size={22} /></div>
          <div style={st('font-size:20px;font-weight:800;letter-spacing:-.02em;color:var(--fg-primary)')}>PetOS</div>
        </div>
        <form onSubmit={onSubmit} style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:28px')}>
          <div style={st('font-size:19px;font-weight:700;color:var(--fg-primary);margin-bottom:4px')}>Chat portal</div>
          <div style={st('font-size:13px;color:var(--fg-tertiary);margin-bottom:22px')}>Log in to message your dog walker</div>

          {error ? (
            <div style={st('background:var(--color-error-50);color:var(--color-error-700);border-radius:10px;padding:10px 13px;font-size:13px;font-weight:600;margin-bottom:16px')}>{error}</div>
          ) : null}

          <label style={st('display:block;font-size:12.5px;font-weight:700;color:var(--fg-primary);margin-bottom:7px')}>Email</label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
            style={st('width:100%;box-sizing:border-box;border:1px solid var(--border-default);border-radius:10px;padding:11px 13px;font-family:inherit;font-size:14px;color:var(--fg-primary);background:var(--bg-primary);outline:none;margin-bottom:16px')}
          />

          <label style={st('display:block;font-size:12.5px;font-weight:700;color:var(--fg-primary);margin-bottom:7px')}>Password</label>
          <input
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
            style={st('width:100%;box-sizing:border-box;border:1px solid var(--border-default);border-radius:10px;padding:11px 13px;font-family:inherit;font-size:14px;color:var(--fg-primary);background:var(--bg-primary);outline:none;margin-bottom:22px')}
          />

          <button type="submit" disabled={submitting} style={st(`width:100%;border:none;background:var(--brand-primary);color:#fff;font-family:inherit;font-size:14.5px;font-weight:600;padding:12px;border-radius:11px;cursor:pointer;box-shadow:var(--shadow-ring-primary);${submitting ? 'opacity:.65' : ''}`)}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>

          <div style={st('text-align:center;font-size:13px;color:var(--fg-tertiary);margin-top:18px')}>
            New here? <Link to="/portal/signup" style={st('color:var(--fg-brand);font-weight:600')}>Set up chat access</Link>
          </div>
        </form>
        <div style={st('text-align:center;font-size:11.5px;color:var(--fg-quaternary);margin-top:16px;line-height:16px')}>
          Are you the business owner? <Link to="/login" style={st('color:var(--fg-tertiary);text-decoration:underline')}>Log in here instead</Link>
        </div>
      </div>
    </div>
  );
}
