import { st } from '../lib/st';
import { useApp } from '../state';
import { pageTitleFor } from '../lib/titles';
import { searchFor } from '../lib/search';
import { SearchIcon, SparkleIcon } from './icons';

export function TopBar() {
  const { state, actions } = useApp();
  const [pageTitle, pageSub] = pageTitleFor(state.view, state);
  const results = searchFor(state.search);
  const showSearch = state.search.trim().length > 0;
  const searchEmpty = showSearch && results.length === 0;

  return (
    <div style={st('height:64px;flex:none;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:16px;padding:0 26px;background:var(--bg-primary)')}>
      <div style={st('flex:1')}>
        <div style={st('font-size:18px;font-weight:700;color:var(--fg-primary);letter-spacing:-.01em')}>{pageTitle}</div>
        <div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{pageSub}</div>
      </div>
      <div style={st('position:relative;width:300px')}>
        <div style={st('display:flex;align-items:center;gap:9px;background:var(--bg-tertiary);border-radius:10px;padding:9px 13px')}>
          <span style={st('color:var(--fg-tertiary);display:inline-flex')}><SearchIcon /></span>
          <input
            value={state.search}
            onChange={(e) => actions.setSearch(e.target.value)}
            placeholder="Search pets, clients, invoices…"
            style={st('border:none;background:transparent;outline:none;font-family:inherit;font-size:13.5px;color:var(--fg-primary);width:100%')}
          />
        </div>
        {showSearch ? (
          <div style={st('position:absolute;top:calc(100% + 6px);left:0;right:0;background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:12px;box-shadow:var(--shadow-lg);overflow:hidden;z-index:60')}>
            {results.map((r) => (
              <button
                key={r.key}
                className="search-result-row"
                onClick={() => (r.go === 'client' ? actions.searchClient() : actions.searchOpen(r.go))}
                style={st('display:flex;align-items:center;gap:11px;width:100%;text-align:left;font-family:inherit;padding:10px 13px;border:none;border-bottom:1px solid var(--border-subtle);background:transparent;cursor:pointer')}
              >
                <span style={st(`width:32px;height:32px;border-radius:9px;overflow:hidden;flex:none;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;background:${r.dot}`)}>{r.initial}</span>
                <span style={st('flex:1;min-width:0')}>
                  <span style={st('display:block;font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>{r.title}</span>
                  <span style={st('display:block;font-size:12px;color:var(--fg-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{r.sub}</span>
                </span>
                <span style={st('font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--fg-quaternary);flex:none')}>{r.type}</span>
              </button>
            ))}
            {searchEmpty ? <div style={st('padding:16px 14px;font-size:13px;color:var(--fg-tertiary)')}>No matches</div> : null}
          </div>
        ) : null}
      </div>
      <button
        onClick={actions.toggleCopilot}
        style={st(`display:inline-flex;align-items:center;gap:7px;font-family:inherit;font-size:13px;font-weight:600;padding:9px 14px;border-radius:10px;cursor:pointer;border:1px solid ${state.copilotOpen ? 'transparent' : 'var(--border-default)'};background:${state.copilotOpen ? 'var(--bg-brand-subtle)' : 'var(--bg-primary)'};color:${state.copilotOpen ? 'var(--fg-brand)' : 'var(--fg-secondary)'}`)}
      >
        <SparkleIcon />Copilot
      </button>
      <button
        onClick={actions.openNewWalk}
        style={st('border:none;background:var(--brand-primary);color:var(--brand-on-primary);font-family:inherit;font-size:13.5px;font-weight:600;padding:9px 16px;border-radius:10px;cursor:pointer;box-shadow:var(--shadow-ring-primary)')}
      >
        + New walk
      </button>
    </div>
  );
}
