import { st } from '../lib/st';
import { useApp } from '../state';
import { clientActivity, clientInvoicesDef, clientUpcoming, docs } from '../data';
import { ChevronLeftIcon, DocumentIcon } from '../components/icons';
import { ImageSlot } from '../components/ImageSlot';

const ciPill: Record<string, [string, string]> = {
  paid: ['Paid', 'background:var(--color-success-50);color:var(--color-success-700)'],
  outstanding: ['Due', 'background:var(--color-warning-50);color:var(--color-warning-700)'],
};

const dotVarMap = { brand: 'var(--fg-brand)', info: 'var(--color-info-500)' };

export function Client() {
  const { actions } = useApp();
  const clientInvoices = clientInvoicesDef.map(([no, date, amount, status]) => ({
    no, date, amount, status: ciPill[status][0], pillStyle: `font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;${ciPill[status][1]}`,
  }));

  return (
    <div style={st('animation:vIn .3s var(--ease-out)')}>
      <button
        onClick={() => actions.go('pets')}
        style={st('display:inline-flex;align-items:center;gap:5px;background:transparent;border:none;color:var(--fg-tertiary);font-family:inherit;font-size:13.5px;font-weight:600;cursor:pointer;margin-bottom:16px;padding:0')}
      >
        <ChevronLeftIcon size={18} />All pets &amp; clients
      </button>
      <div style={st('display:grid;grid-template-columns:1fr 340px;gap:20px;align-items:start')}>
        <div style={st('display:flex;flex-direction:column;gap:18px')}>
          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px;display:flex;align-items:center;gap:18px')}>
            <div style={st('width:64px;height:64px;border-radius:999px;background:var(--bg-brand-subtle);color:var(--fg-brand);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:22px;flex:none')}>HW</div>
            <div style={st('flex:1')}>
              <div style={st('font-size:21px;font-weight:700;color:var(--fg-primary);letter-spacing:-.01em')}>Henry Whitfield</div>
              <div style={st('font-size:13.5px;color:var(--fg-tertiary)')}>Hyde Park Gate, Kensington · member 2 yrs · £1,284 lifetime</div>
            </div>
            <button onClick={actions.noop} style={st('border:1px solid var(--border-default);background:var(--bg-primary);color:var(--fg-secondary);font-family:inherit;font-size:13px;font-weight:600;padding:9px 15px;border-radius:10px;cursor:pointer')}>Message</button>
          </div>

          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px')}>
            <div style={st('font-size:14px;font-weight:700;color:var(--fg-primary);margin-bottom:14px')}>Pets (1)</div>
            <div style={st('display:flex;align-items:center;gap:14px;padding:12px;border:1px solid var(--border-subtle);border-radius:14px')}>
              <div style={st('width:52px;height:52px;border-radius:14px;overflow:hidden;flex:none;position:relative')}>
                <ImageSlot shape="rect" fit="cover" src="/assets/pet-luna.png" placeholder="L" />
              </div>
              <div style={st('flex:1')}>
                <div style={st('font-size:15px;font-weight:600;color:var(--fg-primary)')}>Luna · Labrador</div>
                <div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>5 yrs · weekly solo · 208 walks</div>
              </div>
              <span style={st('font-size:11px;font-weight:700;color:var(--color-warning-700);background:var(--color-warning-50);padding:3px 9px;border-radius:999px')}>Joint supplement</span>
            </div>
          </div>

          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px')}>
            <div style={st('font-size:14px;font-weight:700;color:var(--fg-primary);margin-bottom:12px')}>Recent activity</div>
            <div style={st('display:flex;flex-direction:column;gap:12px')}>
              {clientActivity.map((a, i) => (
                <div key={i} style={st('display:flex;align-items:center;gap:12px')}>
                  <span style={{ ...st('width:8px;height:8px;border-radius:999px;flex:none'), background: dotVarMap[a.dotVar] }} />
                  <span style={st('flex:1;font-size:13.5px;color:var(--fg-secondary)')}>{a.label}</span>
                  <span style={st('font-size:12px;color:var(--fg-quaternary)')}>{a.when}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);overflow:hidden')}>
            <div style={st('display:flex;align-items:center;justify-content:space-between;padding:18px 20px 12px')}>
              <div style={st('font-size:14px;font-weight:700;color:var(--fg-primary)')}>Invoices</div>
              <span style={st('font-size:12.5px;color:var(--fg-tertiary)')}>£72.00 billed · all paid</span>
            </div>
            {clientInvoices.map((ci) => (
              <button
                key={ci.no}
                onClick={() => actions.openInvoice(ci.no)}
                style={st('display:grid;grid-template-columns:1.3fr 1fr auto auto;align-items:center;gap:14px;width:100%;text-align:left;padding:12px 20px;border-top:1px solid var(--border-subtle);border-left:none;border-right:none;border-bottom:none;background:transparent;cursor:pointer;font-family:inherit')}
              >
                <span style={st('font-size:13px;color:var(--fg-secondary);font-variant-numeric:tabular-nums')}>{ci.no}</span>
                <span style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{ci.date}</span>
                <span style={st('font-size:13.5px;font-weight:700;color:var(--fg-primary);font-variant-numeric:tabular-nums')}>{ci.amount}</span>
                <span style={st(ci.pillStyle)}>{ci.status}</span>
              </button>
            ))}
          </div>

          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:20px')}>
            <div style={st('font-size:14px;font-weight:700;color:var(--fg-primary);margin-bottom:14px')}>Upcoming walks</div>
            <div style={st('display:flex;flex-direction:column;gap:10px')}>
              {clientUpcoming.map((u, i) => (
                <div key={i} style={st('display:flex;align-items:center;gap:13px;padding:11px 13px;border:1px solid var(--border-subtle);border-radius:13px')}>
                  <span style={st('width:9px;height:9px;border-radius:999px;background:var(--fg-brand);flex:none')} />
                  <div style={st('flex:1')}>
                    <div style={st('font-size:13.5px;font-weight:600;color:var(--fg-primary)')}>{u.when}</div>
                    <div style={st('font-size:12.5px;color:var(--fg-tertiary)')}>{u.label}</div>
                  </div>
                  <span style={st('font-size:12px;color:var(--fg-tertiary)')}>{u.walker}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={st('display:flex;flex-direction:column;gap:18px')}>
          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:18px')}>
            <div style={st('font-size:13px;font-weight:700;color:var(--fg-primary);margin-bottom:12px')}>Access &amp; emergency</div>
            <div style={st('display:flex;flex-direction:column;gap:11px')}>
              <div>
                <div style={st('font-size:11px;color:var(--fg-tertiary);font-weight:600;text-transform:uppercase;letter-spacing:.04em')}>Key safe</div>
                <div style={st('font-size:13.5px;color:var(--fg-primary);font-weight:600')}>Revealed at appointment</div>
              </div>
              <div>
                <div style={st('font-size:11px;color:var(--fg-tertiary);font-weight:600;text-transform:uppercase;letter-spacing:.04em')}>Emergency contact</div>
                <div style={st('font-size:13.5px;color:var(--fg-primary);font-weight:600')}>Rosa (housekeeper) · 07700 900612</div>
              </div>
              <div>
                <div style={st('font-size:11px;color:var(--fg-tertiary);font-weight:600;text-transform:uppercase;letter-spacing:.04em')}>Vet</div>
                <div style={st('font-size:13.5px;color:var(--fg-primary);font-weight:600')}>Elizabeth St. Veterinary</div>
              </div>
            </div>
          </div>
          <div style={st('background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:18px;box-shadow:var(--card-shadow);padding:18px')}>
            <div style={st('font-size:13px;font-weight:700;color:var(--fg-primary);margin-bottom:12px')}>Documents</div>
            <div style={st('display:flex;flex-direction:column;gap:8px')}>
              {docs.map((d) => (
                <div key={d} style={st('display:flex;align-items:center;gap:10px;padding:9px 11px;background:var(--bg-secondary);border-radius:10px')}>
                  <span style={st('color:var(--fg-tertiary)')}><DocumentIcon /></span>
                  <span style={st('flex:1;font-size:13px;color:var(--fg-primary);font-weight:500')}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
