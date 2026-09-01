import { PawIcon } from './icons';

export function LoadingScreen() {
  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F6F5F1' }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: '#127A63', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', animation: 'petosPulse 1.2s ease-in-out infinite' }}>
        <PawIcon size={22} />
      </div>
      <style>{'@keyframes petosPulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .6; transform: scale(.92); } }'}</style>
    </div>
  );
}
