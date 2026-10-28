import React, { useState } from 'react';
import { SceneConfig, TemplateConfig } from '../types';

interface ScenesListProps {
  config: TemplateConfig;
  onChange: (updatedConfig: TemplateConfig) => void;
}

const DOT_COLORS = ['#6ea0ff', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#fb923c', '#60a5fa'];

export const ScenesList: React.FC<ScenesListProps> = ({ config, onChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openSceneId, setOpenSceneId] = useState<string | null>(config.scenes[0]?.id || null);

  const updateScene = (index: number, updates: Partial<SceneConfig>) => {
    const newScenes = [...config.scenes];
    newScenes[index] = { ...newScenes[index], ...updates };

    const newDuration = Math.max(...newScenes.map((s) => s.to), 1);
    onChange({
      ...config,
      scenes: newScenes,
      duration: newDuration
    });
  };

  const removeScene = (index: number) => {
    const newScenes = config.scenes.filter((_, i) => i !== index);
    const newDuration = newScenes.length ? Math.max(...newScenes.map((s) => s.to)) : 1;
    onChange({
      ...config,
      scenes: newScenes,
      duration: newDuration
    });
  };

  const addScene = () => {
    const lastScene = config.scenes[config.scenes.length - 1];
    const startTime = lastScene ? lastScene.to : 0;
    const endTime = startTime + 3;
    const newId = `scene-${Date.now()}`;

    const newScene: SceneConfig = {
      id: newId,
      label: `Scene ${config.scenes.length + 1}`,
      text: 'New scene text',
      from: startTime,
      to: endTime,
      springK: 220,
      springD: 22
    };

    const newScenes = [...config.scenes, newScene];
    onChange({
      ...config,
      scenes: newScenes,
      duration: endTime
    });
    setOpenSceneId(newId);
  };

  return (
    <div className={`sidebar-section ${collapsed ? 'collapsed' : ''}`} id="scenes-section">
      <div
        className="sidebar-section-header"
        id="scenes-toggle"
        onClick={() => setCollapsed(!collapsed)}
      >
        <h2>🎬 Scenes ({config.scenes.length})</h2>
        <span className="chevron">▼</span>
      </div>

      <div className="sidebar-section-content" id="scenes-list">
        {config.scenes.map((scene, index) => {
          const isOpen = openSceneId === scene.id;
          const dotColor = DOT_COLORS[index % DOT_COLORS.length];

          return (
            <div
              key={scene.id}
              className={`scene-item ${isOpen ? 'open' : ''}`}
              id={`scene-${scene.id}`}
            >
              <div
                className="scene-header"
                onClick={() => setOpenSceneId(isOpen ? null : scene.id)}
              >
                <div className="scene-header-left">
                  <div className="scene-dot" style={{ background: dotColor }} />
                  <span className="scene-name">{scene.label}</span>
                </div>
                <span className="scene-timing">
                  {scene.from.toFixed(1)}s – {scene.to.toFixed(1)}s
                </span>
              </div>

              {isOpen && (
                <div className="scene-body">
                  <div className="form-group">
                    <label className="form-label">Text</label>
                    <input
                      className="form-input scene-text"
                      type="text"
                      value={scene.text}
                      placeholder="Scene text (use | for stagger)"
                      onChange={(e) => updateScene(index, { text: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Label</label>
                    <input
                      className="form-input scene-label-input"
                      type="text"
                      value={scene.label}
                      onChange={(e) => updateScene(index, { label: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Start (s)</label>
                      <input
                        className="form-input scene-from"
                        type="number"
                        step="0.5"
                        min="0"
                        value={scene.from}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          updateScene(index, { from: val });
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">End (s)</label>
                      <input
                        className="form-input scene-to"
                        type="number"
                        step="0.5"
                        min="0"
                        value={scene.to}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || scene.from + 1;
                          updateScene(index, { to: val });
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Spring Stiffness (k: {scene.springK})</label>
                    <div className="range-group">
                      <input
                        className="range-slider scene-spring-k"
                        type="range"
                        min="60"
                        max="400"
                        value={scene.springK}
                        onChange={(e) =>
                          updateScene(index, { springK: parseInt(e.target.value, 10) || 220 })
                        }
                      />
                      <span className="range-value scene-k-val">{scene.springK}</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Spring Damping (d: {scene.springD})</label>
                    <div className="range-group">
                      <input
                        className="range-slider scene-spring-d"
                        type="range"
                        min="8"
                        max="40"
                        value={scene.springD}
                        onChange={(e) =>
                          updateScene(index, { springD: parseInt(e.target.value, 10) || 22 })
                        }
                      />
                      <span className="range-value scene-d-val">{scene.springD}</span>
                    </div>
                  </div>

                  {config.scenes.length > 1 && (
                    <button
                      className="btn btn-ghost"
                      style={{ color: 'var(--error)', fontSize: '0.78rem', marginTop: '8px' }}
                      onClick={() => removeScene(index)}
                    >
                      Remove Scene
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <button
          className="btn btn-secondary btn-block"
          style={{ marginTop: '8px' }}
          onClick={addScene}
        >
          + Add Scene
        </button>
      </div>
    </div>
  );
};
