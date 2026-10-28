import React, { useState } from 'react';
import { BrandConfig } from '../types';
import { FONT_OPTIONS, saveBrand } from '../templates/base';

interface BrandKitProps {
  brand: BrandConfig;
  onChange: (updated: BrandConfig) => void;
}

export const BrandKit: React.FC<BrandKitProps> = ({ brand, onChange }) => {
  const [collapsed, setCollapsed] = useState(false);

  const updateField = <K extends keyof BrandConfig>(field: K, value: BrandConfig[K]) => {
    const updated = { ...brand, [field]: value };
    saveBrand(updated);
    onChange(updated);
  };

  const handleHexChange = (field: 'accentColor' | 'bgColor' | 'textColor', value: string) => {
    updateField(field, value);
  };

  return (
    <div className={`sidebar-section ${collapsed ? 'collapsed' : ''}`} id="brand-section">
      <div
        className="sidebar-section-header"
        id="brand-toggle"
        onClick={() => setCollapsed(!collapsed)}
      >
        <h2>🎨 Brand Kit</h2>
        <span className="chevron">▼</span>
      </div>

      <div className="sidebar-section-content">
        <div className="form-group">
          <label className="form-label" htmlFor="brand-name">
            Brand Name
          </label>
          <input
            className="form-input"
            type="text"
            id="brand-name"
            value={brand.name}
            placeholder="Your brand name"
            onChange={(e) => updateField('name', e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Accent Color</label>
            <div className="color-picker-group">
              <div className="color-swatch" style={{ background: brand.accentColor }}>
                <input
                  type="color"
                  id="brand-accent"
                  value={brand.accentColor}
                  onChange={(e) => updateField('accentColor', e.target.value)}
                />
              </div>
              <input
                className="color-hex-input"
                id="brand-accent-hex"
                value={brand.accentColor}
                maxLength={7}
                onChange={(e) => handleHexChange('accentColor', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Background</label>
            <div className="color-picker-group">
              <div className="color-swatch" style={{ background: brand.bgColor }}>
                <input
                  type="color"
                  id="brand-bg"
                  value={brand.bgColor}
                  onChange={(e) => updateField('bgColor', e.target.value)}
                />
              </div>
              <input
                className="color-hex-input"
                id="brand-bg-hex"
                value={brand.bgColor}
                maxLength={7}
                onChange={(e) => handleHexChange('bgColor', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Text Color</label>
            <div className="color-picker-group">
              <div className="color-swatch" style={{ background: brand.textColor }}>
                <input
                  type="color"
                  id="brand-text-color"
                  value={brand.textColor}
                  onChange={(e) => updateField('textColor', e.target.value)}
                />
              </div>
              <input
                className="color-hex-input"
                id="brand-text-hex"
                value={brand.textColor}
                maxLength={7}
                onChange={(e) => handleHexChange('textColor', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="brand-direction">
              Direction
            </label>
            <select
              className="form-select"
              id="brand-direction"
              value={brand.direction}
              onChange={(e) => updateField('direction', e.target.value as 'rtl' | 'ltr')}
            >
              <option value="rtl">RTL (Arabic)</option>
              <option value="ltr">LTR (English)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="brand-font">
            Font Family
          </label>
          <select
            className="form-select"
            id="brand-font"
            value={brand.font}
            onChange={(e) => updateField('font', e.target.value)}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
