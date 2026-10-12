/**
 * Gallery Component — Template selection grid
 * Shows animated thumbnail previews for each template.
 */

import * as kineticText from '../templates/kinetic-text.js';
import * as productShowcase from '../templates/product-showcase.js';
import * as brandIntro from '../templates/brand-intro.js';

export const TEMPLATES = [kineticText, productShowcase, brandIntro];

/** Lookup a template by its meta.id */
export function getTemplateById(id) {
  return TEMPLATES.find(t => t.meta.id === id) || null;
}

/**
 * Render the gallery view into the container
 */
export function renderGallery(container, onSelect) {
  container.innerHTML = '';
  const view = document.createElement('div');
  view.className = 'gallery-view view-enter';

  // Header
  view.innerHTML = `
    <div class="gallery-header">
      <h1>Choose a Template</h1>
      <p>Pick a motion style, customize it with your brand, preview live, and export a TikTok-ready MP4.</p>
    </div>
    <div class="gallery-grid" id="gallery-grid"></div>
  `;
  container.appendChild(view);

  const grid = view.querySelector('#gallery-grid');

  TEMPLATES.forEach(template => {
    const card = createTemplateCard(template, onSelect);
    grid.appendChild(card);
  });
}

/**
 * Create a single template card with animated thumbnail
 */
function createTemplateCard(template, onSelect) {
  const { meta } = template;

  const card = document.createElement('div');
  card.className = 'template-card';
  card.id = `card-${meta.id}`;

  card.innerHTML = `
    <div class="template-card-preview">
      <canvas width="1080" height="1920" id="thumb-${meta.id}"></canvas>
      <span class="template-card-badge">${meta.category}</span>
    </div>
    <div class="template-card-body">
      <h3>${meta.name}</h3>
      <p>${meta.description}</p>
      <div class="template-card-tags">
        ${meta.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    </div>
  `;

  // Click handler
  card.addEventListener('click', () => onSelect(meta.id));

  // Start animated thumbnail preview
  requestAnimationFrame(() => {
    const canvas = card.querySelector(`#thumb-${meta.id}`);
    if (canvas) startThumbnailPreview(canvas, template);
  });

  return card;
}

/**
 * Run a low-FPS preview animation on a thumbnail canvas.
 * Uses an iframe approach for isolation.
 */
function startThumbnailPreview(canvas, template) {
  const config = template.defaultConfig();
  const html = template.toHTML(config);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  // Create a hidden iframe to run the animation
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:absolute;width:0;height:0;border:none;opacity:0;pointer-events:none;';
  iframe.src = url;
  document.body.appendChild(iframe);

  const ctx = canvas.getContext('2d');
  let time = 0;
  let animId = null;
  let destroyed = false;

  iframe.onload = () => {
    URL.revokeObjectURL(url);

    const tick = () => {
      if (destroyed) return;
      try {
        const iframeCanvas = iframe.contentDocument?.getElementById('c');
        if (iframeCanvas && iframe.contentWindow?.seek) {
          iframe.contentWindow.seek(time);
          ctx.clearRect(0, 0, 1080, 1920);
          ctx.drawImage(iframeCanvas, 0, 0);
        }
      } catch (e) {
        // cross-origin errors on cleanup
      }
      time = (time + 1 / 15) % config.duration; // ~15fps
      animId = setTimeout(tick, 66); // throttled
    };

    tick();
  };

  // Cleanup when card is removed from DOM
  const observer = new MutationObserver(() => {
    if (!document.body.contains(canvas)) {
      destroyed = true;
      clearTimeout(animId);
      iframe.remove();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
