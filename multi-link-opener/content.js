(() => {
  const STATE = {
    selecting: false,
    selected: new Map(), // Map<url, text>
    ui: null,
    listenersActive: false,
  };

  function createUI() {
    if (STATE.ui) return STATE.ui;

    const wrap = document.createElement('div');
    wrap.id = 'mlo-ui';
    wrap.innerHTML = `
      <div class="mlo-panel">
        <div class="mlo-row">
          <strong>Multi‑Link Opener</strong>
          <span class="mlo-dot" title="Selection mode is ON"></span>
        </div>
        <div class="mlo-row mlo-actions">
          <button id="mlo-open">Open All</button>
          <button id="mlo-export">Export CSV</button>
          <button id="mlo-clear">Clear</button>
          <button id="mlo-exit">Exit</button>
        </div>
        <div class="mlo-row mlo-count">
          Selected: <span id="mlo-count">0</span>
        </div>
        <div class="mlo-hint">Tip: Click links to toggle selection. Shift+Drag to multi-select area.</div>
      </div>`;

    document.documentElement.appendChild(wrap);
    wrap.querySelector('#mlo-open').addEventListener('click', openAll);
    wrap.querySelector('#mlo-export').addEventListener('click', exportCSV);
    wrap.querySelector('#mlo-clear').addEventListener('click', clearSelection);
    wrap.querySelector('#mlo-exit').addEventListener('click', disableSelecting);
    STATE.ui = wrap;
    return wrap;
  }

  function enableSelecting() {
    if (STATE.selecting) return;
    STATE.selecting = true;
    createUI();
    STATE.ui.style.display = 'block';
    document.documentElement.classList.add('mlo-selecting');
    attachListeners();
  }

  function disableSelecting() {
    STATE.selecting = false;
    document.documentElement.classList.remove('mlo-selecting');
    if (STATE.ui) STATE.ui.style.display = 'none';
    detachListeners();
  }

  function attachListeners() {
    if (STATE.listenersActive) return;
    STATE.listenersActive = true;

    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);

    // Optional: box selection with Shift + drag
    let start = null, box = null;
    document.addEventListener('mousedown', (e) => {
      if (!STATE.selecting || !e.shiftKey) return;
      start = { x: e.clientX, y: e.clientY };
      box = document.createElement('div');
      box.className = 'mlo-lasso';
      document.body.appendChild(box);
      e.preventDefault();
    }, true);
    document.addEventListener('mousemove', (e) => {
      if (!start || !box) return;
      const x = Math.min(e.clientX, start.x);
      const y = Math.min(e.clientY, start.y);
      const w = Math.abs(e.clientX - start.x);
      const h = Math.abs(e.clientY - start.y);
      Object.assign(box.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
    }, true);
    document.addEventListener('mouseup', (e) => {
      if (!start || !box) return;
      const rect = box.getBoundingClientRect();
      box.remove();
      box = null; start = null;
      const links = Array.from(document.querySelectorAll('a[href]'));
      links.forEach(a => {
        const r = a.getBoundingClientRect();
        const intersect = !(r.right < rect.left || r.left > rect.right || r.bottom < rect.top || r.top > rect.bottom);
        if (intersect && isVisible(a)) toggleSelect(a, true);
      });
      updateCount();
    }, true);
  }

  function detachListeners() {
    if (!STATE.listenersActive) return;
    STATE.listenersActive = false;
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
  }

  function onClick(e) {
    if (!STATE.selecting) return;

    if (STATE.ui && STATE.ui.contains(e.target)) return;

    const a = e.target.closest('a[href]');
    if (!a) return;

    e.preventDefault();
    e.stopPropagation();

    const add = !a.classList.contains('mlo-selected');
    toggleSelect(a, add);
    updateCount();
  }

  function onKeyDown(e) {
    if (!STATE.selecting) return;
    if (e.key === 'Escape') {
      disableSelecting();
    }
  }

  function toggleSelect(a, add) {
    const url = a.href;
    if (!/^https?:\/\//i.test(url)) return;

    const text = (a.textContent || a.getAttribute('aria-label') || a.title || '').trim().replace(/\s+/g, ' ');

    if (add) {
      STATE.selected.set(url, text);
      a.classList.add('mlo-selected');
    } else {
      STATE.selected.delete(url);
      a.classList.remove('mlo-selected');
    }
  }

  function isVisible(el) {
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  }

  function updateCount() {
    const el = STATE.ui?.querySelector('#mlo-count');
    if (el) el.textContent = String(STATE.selected.size);
  }

  function clearSelection() {
    STATE.selected.clear();
    document.querySelectorAll('a.mlo-selected').forEach(a => a.classList.remove('mlo-selected'));
    updateCount();
  }

  function openAll() {
    const urls = Array.from(STATE.selected.keys());
    if (urls.length === 0) return;

    const limit = 20;
    if (urls.length > limit && !confirm(`You're about to open ${urls.length} tabs. Continue?`)) {
      return;
    }

    chrome.runtime.sendMessage({ type: 'OPEN_TABS', urls }, (res) => {
      if (res?.ok) {
        // keep selection
      }
    });
  }

  function exportCSV() {
    if (STATE.selected.size === 0) return;
    // Build CSV: columns: Name, URL
    const rows = [['Name', 'URL']];
    STATE.selected.forEach((text, url) => {
      rows.push([text || '', url]);
    });

    const csv = rows.map(cols => cols.map(c => {
      const s = (c ?? '').toString();
      // Escape double-quotes by doubling them and wrap in quotes if needed
      if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    }).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    const dt = new Date();
    const pad = n => String(n).padStart(2, '0');
    const fname = `links-${dt.getFullYear()}${pad(dt.getMonth()+1)}${pad(dt.getDate())}-${pad(dt.getHours())}${pad(dt.getMinutes())}${pad(dt.getSeconds())}.csv`;
    a.href = url;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 2000);
  }

  // Listen for popup messages
  chrome.runtime.onMessage.addListener((msg) => {
    if (!msg) return;
    if (msg.type === 'TOGGLE_SELECT') {
      if (!STATE.selecting) enableSelecting(); else disableSelecting();
    } else if (msg.type === 'REQUEST_OPEN') {
      openAll();
    } else if (msg.type === 'REQUEST_EXPORT') {
      exportCSV();
    }
  });

  // Expose for debugging
  window.__MLO__ = { enableSelecting, disableSelecting };
})();
