import React from 'react';
import { TEMPLATES } from '../templates';
import { TemplateCard } from './TemplateCard';

interface GalleryProps {
  onSelectTemplate: (templateId: string) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ onSelectTemplate }) => {
  return (
    <div className="gallery-view view-enter">
      <div className="gallery-header">
        <h1>Motion Templates</h1>
        <p>Pick a motion style, customize with your brand, preview live, and export a TikTok-ready 9:16 MP4.</p>
        <div className="gallery-subtitle">
          <span className="gallery-badge">⚡ Spring Physics</span>
          <span className="gallery-badge">🎨 Brand Kit</span>
          <span className="gallery-badge">📱 9:16 Ready</span>
          <span className="gallery-badge">🎬 60fps Export</span>
        </div>
      </div>
      <div className="gallery-grid" id="gallery-grid">
        {TEMPLATES.map((template) => (
          <TemplateCard
            key={template.meta.id}
            template={template}
            onSelect={onSelectTemplate}
          />
        ))}
      </div>
    </div>
  );
};
