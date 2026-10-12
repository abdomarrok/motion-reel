/**
 * Motion Reel Studio — Main Entry Point
 * Hash-based routing between Gallery and Editor views.
 */
import { renderGallery } from './components/gallery.js';
import { renderEditor } from './components/editor.js';

const content = document.getElementById('content');
let currentCleanup = null;

/**
 * Simple hash router
 */
function route() {
  // Cleanup previous view
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  const hash = window.location.hash || '#/';
  const [path, param] = parseHash(hash);

  // Update nav active state
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

  if (path === '/edit' && param) {
    // Editor view
    document.querySelector('#nav-gallery')?.classList.remove('active');
    currentCleanup = renderEditor(content, param, () => {
      window.location.hash = '#/';
    });
  } else {
    // Gallery view (default)
    document.querySelector('#nav-gallery')?.classList.add('active');
    renderGallery(content, (templateId) => {
      window.location.hash = `#/edit/${templateId}`;
    });
  }
}

/**
 * Parse hash into [path, param]
 * Examples:
 *   #/             → ['/', null]
 *   #/edit/kinetic-text → ['/edit', 'kinetic-text']
 */
function parseHash(hash) {
  const clean = hash.replace('#', '') || '/';
  const parts = clean.split('/').filter(Boolean);

  if (parts.length === 0) return ['/', null];
  if (parts.length === 1) return [`/${parts[0]}`, null];
  return [`/${parts[0]}`, parts.slice(1).join('/')];
}

// Listen for hash changes
window.addEventListener('hashchange', route);

// Initial route
route();
