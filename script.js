
(() => {
  // 1) Daten holen (aus data.js)
  const ITEMS = Array.isArray(window.DATA) ? window.DATA : [];

  // 2) DOM-Elemente referenzieren
  document.addEventListener('DOMContentLoaded', () => {
    const pageEl  = document.getElementById('page-0');
    const pagerEl = document.getElementById('book-pager');

    if (!pageEl || !pagerEl) {
      console.error('page-0 oder book-pager nicht gefunden.');
      return;
    }

    // 3) Seiten vorbereiten
    const pages = [];
    // Seite 1: Inhaltsverzeichnis
    pages.push(renderTOCPage(ITEMS));

    // Danach: je Artikel genau eine Seite
    for (const it of ITEMS) {
      pages.push(renderEntryPage(it));
    }

    // Mapping: id -> Seitennummer (TOC ist Index 0)
    const idToPage = new Map();
    ITEMS.forEach((it, i) => idToPage.set(it.id, i + 1));

    // 4) Renderer / Pager
    let idx = 0;

    function show(i) {
      idx = Math.max(0, Math.min(pages.length - 1, i));
      pageEl.classList.add('turn');            // subtile “Umblätter”-Optik
      pageEl.innerHTML = pages[idx];
      // nach der Animation Klasse wieder entfernen
      setTimeout(() => pageEl.classList.remove('turn'), 420);
      renderPager();
    }

    function renderPager() {
      const prevDisabled = idx === 0;
      const nextDisabled = idx === pages.length - 1;
      pagerEl.innerHTML = `
        <button ${prevDisabled ? 'disabled' : ''} data-nav="start">‹ Inhalt</button>
        <button ${prevDisabled ? 'disabled' : ''} data-nav="prev">‹ Zurück</button>
        <span>Seite ${idx + 1} / ${pages.length}</span>
        <button ${nextDisabled ? 'disabled' : ''} data-nav="next">Weiter ›</button>
      `;
    }

    // Pager-Buttons
    pagerEl.addEventListener('click', (ev) => {
      const btn = ev.target.closest('button[data-nav]');
      if (!btn) return;
      const dir = btn.getAttribute('data-nav');
      if (dir === "start") show(0)
      show(idx + (dir === 'next' ? 1 : -1));
    });

    // Links innerhalb der Seite (TOC & Querverweise mit #id)
    pageEl.addEventListener('click', (ev) => {
      const a = ev.target.closest('a[href^="#"]');
      if (!a) return;
      const targetId = decodeURIComponent(a.getAttribute('href').slice(1));
      if (idToPage.has(targetId)) {
        ev.preventDefault();
        show(idToPage.get(targetId));
      }
    });

    // Start auf TOC
    show(0);
  });

  // ---------------- Helpers ----------------

  function renderTOCPage(items) {
    const list = items.map(it =>
      `<li><a href="#${escapeAttr(it.id)}">${escapeHtml(it.title)}</a></li>`
    ).join('');
    return `
      <div class="entry">
        <h2>Inhalt</h2>
        <ol>${list}</ol>
      </div>
    `;
  }

  function renderEntryPage(item) {
    const paras = splitParas(item.body).map(p => `<p>${escapeHtml(p)}</p>`).join('');
    return `
      <div class="entry" id="${escapeAttr(item.id)}">
        <h2>${escapeHtml(item.title)}</h2>
        ${paras || '<p></p>'}
      </div>
    `;
  }

  function splitParas(text = '') {
    return String(text)
      .replace(/\r\n/g, '\n')
      .split(/\n{2,}/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  function escapeAttr(s) {
    return String(s).replace(/"/g, '&quot;');
  }
})();

