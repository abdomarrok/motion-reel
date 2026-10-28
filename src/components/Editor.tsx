import React, { useState, useMemo, useEffect } from 'react';
import { getTemplateById } from '../templates';
import { loadBrand } from '../templates/base';
import { TemplateConfig, BrandConfig } from '../types';
import { Preview } from './Preview';
import { BrandKit } from './BrandKit';
import { ScenesList } from './ScenesList';
import { ExportModal } from './ExportModal';

interface EditorProps {
  templateId: string;
  onBack: () => void;
}

export const Editor: React.FC<EditorProps> = ({ templateId, onBack }) => {
  const template = useMemo(() => getTemplateById(templateId), [templateId]);
  const [config, setConfig] = useState<TemplateConfig | null>(null);
  const [showExport, setShowExport] = useState(false);

  // Initialize config when template changes
  useEffect(() => {
    if (template) {
      const storedBrand = loadBrand();
      setConfig(template.defaultConfig(storedBrand));
    }
  }, [template]);

  // Generate preview HTML whenever config changes
  const previewHtml = useMemo(() => {
    if (!template || !config) return '';
    return template.toHTML(config);
  }, [template, config]);

  if (!template || !config) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3>Template not found</h3>
        <p>The selected motion template could not be loaded.</p>
        <button
          className="btn btn-secondary"
          style={{ marginTop: '16px' }}
          onClick={onBack}
        >
          ← Return to Templates
        </button>
      </div>
    );
  }

  const handleBrandChange = (updatedBrand: BrandConfig) => {
    setConfig((prev) => (prev ? { ...prev, brand: updatedBrand } : null));
  };

  const handleScenesChange = (updatedConfig: TemplateConfig) => {
    setConfig(updatedConfig);
  };

  return (
    <div className="editor-view view-enter">
      <Preview html={previewHtml} duration={config.duration} />

      <div className="editor-sidebar" id="editor-sidebar">
        <div className="editor-back-row">
          <button className="btn btn-ghost" id="editor-back" onClick={onBack}>
            ← Back
          </button>
          <span className="editor-template-name">{template.meta.name}</span>
        </div>

        <BrandKit brand={config.brand} onChange={handleBrandChange} />

        <ScenesList config={config} onChange={handleScenesChange} />

        <div style={{ padding: '16px 0' }}>
          <button
            className="btn btn-primary btn-lg btn-block"
            id="export-btn"
            onClick={() => setShowExport(true)}
          >
            🎬 Export MP4
          </button>
        </div>
      </div>

      {showExport && (
        <ExportModal
          templateId={templateId}
          config={config}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
};
