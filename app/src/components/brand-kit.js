/**
 * Brand Kit Component — Brand settings form that persists to localStorage.
 */

const STORAGE_KEY = 'motion-reel-brand';

const DEFAULT_BRAND = {
  name: 'MARROK',
  accentColor: '#6EA0FF',
  bgColor: '#080A12',
  textColor: '#FFFFFF',
  font: 'Cairo',
  direction: 'rtl'
};

const FONT_OPTIONS = [
  'Cairo',
  'Inter',
  'Roboto',
  'Outfit',
  'Montserrat',
  'Poppins',
  'Playfair Display',
  'Source Serif 4',
  'Noto Sans Arabic',
  'IBM Plex Sans Arabic'
];

/** Load brand from localStorage or return defaults */
export function loadBrand() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_BRAND, ...JSON.parse(stored) };
  } catch (e) {
    // ignore parse errors
  }
  return { ...DEFAULT_BRAND };
}

/** Save brand to localStorage */
export function saveBrand(brand) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(brand));
}

/**
 * Render the brand kit form
 * @param {HTMLElement} container
 * @param {object} brand - Current brand settings
 * @param {function} onChange - Called with updated brand on any change
 */
export function renderBrandKit(container, brand, onChange) {
  container.innerHTML = `
    <div class="sidebar-section" id="brand-section">
      <div class="sidebar-section-header" id="brand-toggle">
        <h2>🎨 Brand Kit</h2>
        <span class="chevron">▼</span>
      </div>
      <div class="sidebar-section-content">
        <div class="form-group">
          <label class="form-label" for="brand-name">Brand Name</label>
          <input class="form-input" type="text" id="brand-name" value="${escapeAttr(brand.name)}" placeholder="Your brand name">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Accent Color</label>
            <div class="color-picker-group">
              <div class="color-swatch" style="background:${brand.accentColor}">
                <input type="color" id="brand-accent" value="${brand.accentColor}">
              </div>
              <input class="color-hex-input" id="brand-accent-hex" value="${brand.accentColor}" maxlength="7">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Background</label>
            <div class="color-picker-group">
              <div class="color-swatch" style="background:${brand.bgColor}">
                <input type="color" id="brand-bg" value="${brand.bgColor}">
              </div>
              <input class="color-hex-input" id="brand-bg-hex" value="${brand.bgColor}" maxlength="7">
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Text Color</label>
            <div class="color-picker-group">
              <div class="color-swatch" style="background:${brand.textColor}">
                <input type="color" id="brand-text-color" value="${brand.textColor}">
              </div>
              <input class="color-hex-input" id="brand-text-hex" value="${brand.textColor}" maxlength="7">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="brand-direction">Direction</label>
            <select class="form-select" id="brand-direction">
              <option value="rtl" ${brand.direction === 'rtl' ? 'selected' : ''}>RTL (Arabic)</option>
              <option value="ltr" ${brand.direction === 'ltr' ? 'selected' : ''}>LTR (English)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="brand-font">Font Family</label>
          <select class="form-select" id="brand-font">
            ${FONT_OPTIONS.map(f => `<option value="${f}" ${brand.font === f ? 'selected' : ''}>${f}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>
  `;

  // Toggle collapse
  container.querySelector('#brand-toggle').addEventListener('click', () => {
    container.querySelector('#brand-section').classList.toggle('collapsed');
  });

  // Wire up change handlers
  const emit = () => {
    const updated = readBrandFromDOM(container);
    saveBrand(updated);
    onChange(updated);
  };

  // Text input
  container.querySelector('#brand-name').addEventListener('input', emit);

  // Color pickers + hex inputs
  setupColorPair(container, 'brand-accent', 'brand-accent-hex', emit);
  setupColorPair(container, 'brand-bg', 'brand-bg-hex', emit);
  setupColorPair(container, 'brand-text-color', 'brand-text-hex', emit);

  // Selects
  container.querySelector('#brand-font').addEventListener('change', emit);
  container.querySelector('#brand-direction').addEventListener('change', emit);
}

/** Read current brand values from DOM inputs */
function readBrandFromDOM(container) {
  return {
    name: container.querySelector('#brand-name').value,
    accentColor: container.querySelector('#brand-accent').value,
    bgColor: container.querySelector('#brand-bg').value,
    textColor: container.querySelector('#brand-text-color').value,
    font: container.querySelector('#brand-font').value,
    direction: container.querySelector('#brand-direction').value
  };
}

/** Sync a color picker and hex text input */
function setupColorPair(container, colorId, hexId, onChange) {
  const picker = container.querySelector(`#${colorId}`);
  const hex = container.querySelector(`#${hexId}`);
  const swatch = picker.parentElement;

  picker.addEventListener('input', () => {
    hex.value = picker.value;
    swatch.style.background = picker.value;
    onChange();
  });

  hex.addEventListener('input', () => {
    const val = hex.value;
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      picker.value = val;
      swatch.style.background = val;
      onChange();
    }
  });
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
