/**
 * Editor Component — Scene editor with live preview.
 * Split view: canvas preview left, settings panel right.
 */
import { Preview } from './preview.js';
import { renderBrandKit, loadBrand, saveBrand } from './brand-kit.js';
import { showExportModal } from './export-modal.js';
import { getTemplateById } from './gallery.js';

/** Debounce helper */
function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Render the editor view
 * @param {HTMLElement} container
 * @param {string} templateId
 * @param {function} onBack — navigate back to gallery
 */
export function renderEditor(container, templateId, onBack) {
  const template = getTemplateById(templateId);
  if (!template) {
    container.innerHTML = `<div class="empty-state"><h3>Template not found</h3></div>`;
    return;
  }

  // Initialize config from template defaults + saved brand
  const brand = loadBrand();
  let config = template.defaultConfig(brand);

  // Build the editor layout
  container.innerHTML = `
    <div class="editor-view view-enter">
      <div class="editor-preview" id="editor-preview-area"></div>
      <div class="editor-sidebar" id="editor-sidebar">
        <div style="margin-bottom:16px;">
          <button class="btn btn-ghost" id="editor-back">← Back to Templates</button>
        </div>
        <div id="brand-kit-container"></div>
        <div id="scenes-container"></div>
        <div style="padding:16px 0;">
          <button class="btn btn-primary btn-lg btn-block" id="export-btn">🎬 Export MP4</button>
        </div>
      </div>
    </div>
  `;

  // Back button
  container.querySelector('#editor-back').addEventListener('click', onBack);

  // Initialize preview
  const previewArea = container.querySelector('#editor-preview-area');
  const preview = new Preview(previewArea);

  // Generate HTML and load into preview
  const loadPreview = () => {
    const html = template.toHTML(config);
    preview.load(html, config.duration);
  };

  const reloadPreview = debounce(() => {
    const html = template.toHTML(config);
    preview.reload(html, config.duration);
  }, 400);

  // Render brand kit
  const brandContainer = container.querySelector('#brand-kit-container');
  renderBrandKit(brandContainer, config.brand, (updatedBrand) => {
    config.brand = updatedBrand;
    reloadPreview();
  });

  // Render scene editors
  const scenesContainer = container.querySelector('#scenes-container');
  renderScenes(scenesContainer, config, reloadPreview);

  // Export button
  container.querySelector('#export-btn').addEventListener('click', () => {
    showExportModal(templateId, config);
  });

  // Initial load
  loadPreview();

  // Return cleanup function
  return () => preview.destroy();
}

/**
 * Render the scenes accordion
 */
function renderScenes(container, config, onChange) {
  const section = document.createElement('div');
  section.className = 'sidebar-section';
  section.innerHTML = `
    <div class="sidebar-section-header" id="scenes-toggle">
      <h2>🎬 Scenes</h2>
      <span class="chevron">▼</span>
    </div>
    <div class="sidebar-section-content" id="scenes-list"></div>
  `;
  container.appendChild(section);

  section.querySelector('#scenes-toggle').addEventListener('click', () => {
    section.classList.toggle('collapsed');
  });

  const list = section.querySelector('#scenes-list');
  config.scenes.forEach((scene, index) => {
    const item = createSceneItem(scene, index, config, onChange);
    list.appendChild(item);
  });

  // Add scene button
  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn-secondary btn-block';
  addBtn.style.marginTop = '8px';
  addBtn.textContent = '+ Add Scene';
  addBtn.addEventListener('click', () => {
    const lastScene = config.scenes[config.scenes.length - 1];
    const newScene = {
      id: `scene-${Date.now()}`,
      label: `Scene ${config.scenes.length + 1}`,
      text: 'New scene text',
      from: lastScene ? lastScene.to : 0,
      to: (lastScene ? lastScene.to : 0) + 3,
      springK: 220,
      springD: 22
    };
    config.scenes.push(newScene);
    config.duration = newScene.to;
    const item = createSceneItem(newScene, config.scenes.length - 1, config, onChange);
    list.appendChild(item);
    onChange();
  });
  container.appendChild(addBtn);
}

/**
 * Create a single scene accordion item
 */
function createSceneItem(scene, index, config, onChange) {
  const item = document.createElement('div');
  item.className = 'scene-item';
  item.id = `scene-${scene.id}`;

  const colors = ['#6ea0ff', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#fb923c', '#60a5fa'];
  const dotColor = colors[index % colors.length];

  item.innerHTML = `
    <div class="scene-header">
      <div class="scene-header-left">
        <div class="scene-dot" style="background:${dotColor}"></div>
        <span class="scene-name">${escapeHTML(scene.label)}</span>
      </div>
      <span class="scene-timing">${scene.from.toFixed(1)}s – ${scene.to.toFixed(1)}s</span>
    </div>
    <div class="scene-body">
      <div class="form-group">
        <label class="form-label">Text</label>
        <input class="form-input scene-text" type="text" value="${escapeAttr(scene.text)}" placeholder="Scene text (use | for stagger)">
      </div>
      <div class="form-group">
        <label class="form-label">Label</label>
        <input class="form-input scene-label-input" type="text" value="${escapeAttr(scene.label)}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Start (s)</label>
          <input class="form-input scene-from" type="number" step="0.5" min="0" value="${scene.from}">
        </div>
        <div class="form-group">
          <label class="form-label">End (s)</label>
          <input class="form-input scene-to" type="number" step="0.5" min="0" value="${scene.to}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Spring Stiffness (k: ${scene.springK})</label>
        <div class="range-group">
          <input class="range-slider scene-spring-k" type="range" min="60" max="400" value="${scene.springK}">
          <span class="range-value scene-k-val">${scene.springK}</span>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Spring Damping (d: ${scene.springD})</label>
        <div class="range-group">
          <input class="range-slider scene-spring-d" type="range" min="8" max="40" value="${scene.springD}">
          <span class="range-value scene-d-val">${scene.springD}</span>
        </div>
      </div>
      <button class="btn btn-ghost" style="color:var(--error); font-size:0.78rem; margin-top:8px;" data-delete-scene="${index}">
        Remove Scene
      </button>
    </div>
  `;

  // Toggle open/close
  item.querySelector('.scene-header').addEventListener('click', () => {
    // Close others
    item.parentElement?.querySelectorAll('.scene-item.open').forEach(el => {
      if (el !== item) el.classList.remove('open');
    });
    item.classList.toggle('open');
  });

  // Wire up inputs
  const emit = () => {
    scene.text = item.querySelector('.scene-text').value;
    scene.label = item.querySelector('.scene-label-input').value;
    scene.from = parseFloat(item.querySelector('.scene-from').value) || 0;
    scene.to = parseFloat(item.querySelector('.scene-to').value) || scene.from + 1;
    scene.springK = parseInt(item.querySelector('.scene-spring-k').value) || 220;
    scene.springD = parseInt(item.querySelector('.scene-spring-d').value) || 22;

    // Update display
    item.querySelector('.scene-name').textContent = scene.label;
    item.querySelector('.scene-timing').textContent = `${scene.from.toFixed(1)}s – ${scene.to.toFixed(1)}s`;
    item.querySelector('.scene-k-val').textContent = scene.springK;
    item.querySelector('.scene-d-val').textContent = scene.springD;

    // Recalc total duration
    config.duration = Math.max(...config.scenes.map(s => s.to));

    onChange();
  };

  item.querySelector('.scene-text').addEventListener('input', emit);
  item.querySelector('.scene-label-input').addEventListener('input', emit);
  item.querySelector('.scene-from').addEventListener('change', emit);
  item.querySelector('.scene-to').addEventListener('change', emit);
  item.querySelector('.scene-spring-k').addEventListener('input', emit);
  item.querySelector('.scene-spring-d').addEventListener('input', emit);

  // Delete
  item.querySelector('[data-delete-scene]').addEventListener('click', (e) => {
    e.stopPropagation();
    const idx = parseInt(e.target.dataset.deleteScene);
    config.scenes.splice(idx, 1);
    config.duration = config.scenes.length ? Math.max(...config.scenes.map(s => s.to)) : 1;
    item.remove();
    onChange();
  });

  return item;
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
