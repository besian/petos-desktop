import type { CSSProperties } from 'react';

interface ImageSlotProps {
  src?: string | null;
  placeholder?: string;
  shape?: 'rect' | 'rounded' | 'circle' | 'pill';
  radius?: number;
  fit?: 'cover' | 'contain';
  style?: CSSProperties;
}

/**
 * Static stand-in for the design tool's editable <image-slot> custom
 * element. This app has no photo-upload backend, so it only needs the
 * two visual states the original renders: a real photo, or a dashed
 * placeholder frame with a caption — never the drag/drop/reframe editing
 * chrome, which belonged to the design canvas, not the product.
 */
export function ImageSlot({ src, placeholder = 'Drop an image', shape = 'rounded', radius = 12, fit = 'cover', style }: ImageSlotProps) {
  const borderRadius = shape === 'circle' ? '50%' : shape === 'pill' ? '9999px' : shape === 'rect' ? 0 : radius;
  // The original <image-slot> custom element is `:host{position:relative}`,
  // so its internal position:absolute layers are always scoped to its own
  // box regardless of whether the call site's wrapper happens to set
  // position:relative. Match that here instead of requiring every caller
  // to add it — several ported call sites (faithfully copied from markup
  // that relied on the custom element's own host positioning) don't.
  const hostStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    ...style,
  };
  const frameStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    borderRadius,
    background: 'rgba(127,127,127,.08)',
  };
  if (src) {
    return (
      <div style={hostStyle}>
        <div style={frameStyle}>
          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }} />
        </div>
      </div>
    );
  }
  return (
    <div style={hostStyle}>
      <div style={frameStyle}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            textAlign: 'center',
            padding: 8,
            color: 'inherit',
            opacity: 0.55,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {placeholder}
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            border: '1.5px dashed currentColor',
            opacity: 0.3,
            borderRadius,
          }}
        />
      </div>
    </div>
  );
}
