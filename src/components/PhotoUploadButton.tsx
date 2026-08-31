import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useAuth } from '../auth/store';
import { uploadPhoto } from '../lib/photoUpload';
import { EditIcon } from './icons';

interface PhotoUploadButtonProps {
  folder: string;
  onUploaded: (url: string) => void;
  children: ReactNode;
  style?: CSSProperties;
  title?: string;
}

export function PhotoUploadButton({ folder, onUploaded, children, style, title }: PhotoUploadButtonProps) {
  const { account } = useAuth();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !account) return;
    setUploading(true);
    const url = await uploadPhoto(account.id, folder, file);
    setUploading(false);
    if (url) onUploaded(url);
  };

  return (
    <div
      style={{ position: 'relative', cursor: 'pointer', ...style }}
      onClick={() => inputRef.current?.click()}
      title={title || 'Click to upload a photo'}
    >
      {children}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} style={{ display: 'none' }} />
      {uploading ? (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'inherit' }}>
          <span style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        </div>
      ) : (
        <div style={{ position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, borderRadius: 999, background: 'rgba(0,0,0,.6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <EditIcon size={9} />
        </div>
      )}
    </div>
  );
}
