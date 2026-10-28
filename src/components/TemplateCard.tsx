import React, { useEffect, useRef } from 'react';
import { TemplateDefinition } from '../types';

interface TemplateCardProps {
  template: TemplateDefinition;
  onSelect: (templateId: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { meta } = template;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let destroyed = false;
    let animId: ReturnType<typeof setTimeout> | null = null;
    let time = 0;

    const config = template.defaultConfig();
    const html = template.toHTML(config);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:none;opacity:0;pointer-events:none;';
    iframe.src = url;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      URL.revokeObjectURL(url);

      const tick = () => {
        if (destroyed) return;
        try {
          const iframeCanvas = iframe.contentDocument?.getElementById('c') as HTMLCanvasElement | null;
          const cw = iframe.contentWindow as unknown as { seek?: (t: number) => void } | null;
          if (iframeCanvas && cw?.seek) {
            cw.seek(time);
            ctx.clearRect(0, 0, 1080, 1920);
            ctx.drawImage(iframeCanvas, 0, 0);
          }
        } catch {
          // ignore transient access during unmount
        }
        time = (time + 1 / 15) % config.duration; // ~15fps preview
        animId = setTimeout(tick, 66);
      };

      tick();
    };

    return () => {
      destroyed = true;
      if (animId) clearTimeout(animId);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };
  }, [template]);

  return (
    <div
      className="template-card"
      id={`card-${meta.id}`}
      onClick={() => onSelect(meta.id)}
    >
      <div className="template-card-preview">
        <canvas ref={canvasRef} width={1080} height={1920} id={`thumb-${meta.id}`} />
        <span className="template-card-badge">{meta.category}</span>
      </div>
      <div className="template-card-body">
        <h3>{meta.name}</h3>
        <p>{meta.description}</p>
        <div className="template-card-tags">
          {meta.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
