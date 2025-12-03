// events.js
// Tabs highlight + filters + compact calendar + host confirmation
(() => {
  // ------------------ Tabs & Scroll Spy ------------------
  const tabs = [...document.querySelectorAll('.tabs .tab[href^="#"]')];
  const sections = tabs
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const setActive = (id) => {
    tabs.forEach((t) => t.classList.toggle('active', t.getAttribute('href').slice(1) === id));
    sections.forEach((s) => s.classList.toggle('is-active', s.id === id));
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const id = tab.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActive(id);
      if (history.replaceState) history.replaceState(null, '', '#' + id);
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      const vis = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (vis) {
        const id = vis.target.id;
        setActive(id);
        if (history.replaceState) history.replaceState(null, '', '#' + id);
      }
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: [0.15, 0.35, 0.55, 0.75] }
  );

  sections.forEach((s) => io.observe(s));

  window.addEventListener('DOMContentLoaded', () => {
    const current = (location.hash || '').slice(1) || sections[0]?.id;
    if (current) setActive(current);
  });

  // ------------------ Event List Filters ------------------
  const list = [...document.querySelectorAll('.event')];
  const q = document.getElementById('q');
  const cat = document.getElementById('cat');
  const month = document.getElementById('monthSelect');
  const quickFilters = [...document.querySelectorAll('[data-quick]')];
  const clear = document.getElementById('clear');

  function applyFilters() {
    const text = (q?.value || '').toLowerCase();
    const c = (cat?.value || '').toLowerCase();
    const m = month?.value || ''; // YYYY-MM

    list.forEach((ev) => {
      const t = (ev.dataset.title || '').toLowerCase();
      const ec = (ev.dataset.cat || '').toLowerCase();
      const d = ev.dataset.date || ''; // YYYY-MM-DD
      const matchText = !text || t.includes(text);
      const matchCat = !c || ec === c;
      const matchMonth = !m || d.startsWith(m);
      ev.style.display = matchText && matchCat && matchMonth ? '' : 'none';
    });
  }

  [q, cat, month].forEach((el) => el && el.addEventListener('input', applyFilters));
  clear?.addEventListener('click', () => {
    if (q) q.value = '';
    if (cat) cat.value = '';
    if (month) month.value = '';
    applyFilters();
  });

  // Quick filters: week/weekend (based on current date)
  function applyQuickFilter(kind) {
    const now = new Date();
    const day = now.getDay(); // 0 Sun

    let start = new Date(now);
    let end = new Date(now);
    if (kind === 'week') {
      // Sunday-Saturday of current week
      start.setDate(now.getDate() - day);
      end.setDate(start.getDate() + 6);
    } else if (kind === 'weekend') {
      // Friday-Sunday window
      const offsetToFri = (5 - day + 7) % 7;
      start.setDate(now.getDate() + offsetToFri);
      end = new Date(start);
      end.setDate(start.getDate() + 2);
    } else {
      start = null;
      end = null;
    }

    list.forEach((ev) => {
      const d = ev.dataset.date || '';
      if (!start || !end || !d) {
        ev.dataset.quickHide = '';
        return;
      }
      const evDate = new Date(d);
      const within = evDate >= start && evDate <= end;
      ev.dataset.quickHide = within ? '' : '1';
    });
    list.forEach((ev) => {
      const hidden = ev.dataset.quickHide === '1';
      const styleHidden = ev.style.display === 'none';
      ev.style.display = hidden || styleHidden ? 'none' : '';
    });
  }

  quickFilters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const kind = btn.dataset.quick || '';
      quickFilters.forEach((b) => b.classList.toggle('active', b === btn));
      applyFilters();
      applyQuickFilter(kind);
    });
  });

  applyFilters(); // Initial state

  // ------------------ Built-in Calendar ------------------
  const titleEl = document.getElementById('calTitle');
  const daysEl = document.getElementById('calDays');

  if (titleEl && daysEl) {
    // EDIT YOUR EVENTS HERE (add/change dates & categories)
    // cat values: {'music','trivia','sports','seasonal'} (for chip colors)
    const EVENTS = [
      { date: '2025-04-18', title: 'The Harbor Band', cat: 'music' },
      { date: '2025-04-22', title: 'Pub Trivia', cat: 'trivia' },
      { date: '2025-04-27', title: 'Baltimore vs Pittsburgh', cat: 'sports' },
      { date: '2025-05-05', title: 'Cinco de Mayo Patio Party', cat: 'seasonal' },
    ];

    // Default to month of first event so chips show on load
    let view = EVENTS.length ? new Date(`${EVENTS[0].date}T00:00:00`) : new Date();

    const fmt = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    function renderCalendar() {
      const year = view.getFullYear();
      const monthIdx = view.getMonth(); // 0..11
      const start = new Date(year, monthIdx, 1);
      const end = new Date(year, monthIdx + 1, 0);
      const firstWeekday = start.getDay(); // 0 Sun .. 6 Sat
      const totalDays = end.getDate();
      const prevEnd = new Date(year, monthIdx, 0).getDate();

      titleEl.textContent = start.toLocaleString(undefined, { month: 'long', year: 'numeric' });

      daysEl.innerHTML = '';
      for (let i = 0; i < 42; i++) {
        const cell = document.createElement('div');
        cell.className = 'cal-day';

        let dnum;
        let cellMonth = monthIdx;
        let cellYear = year;

        if (i < firstWeekday) {
          dnum = prevEnd - (firstWeekday - 1 - i);
          cell.classList.add('out');
          if (monthIdx === 0) cellYear = year - 1;
          cellMonth = (monthIdx + 11) % 12;
        } else if (i >= firstWeekday + totalDays) {
          dnum = i - (firstWeekday + totalDays) + 1;
          cell.classList.add('out');
          if (monthIdx === 11) cellYear = year + 1;
          cellMonth = (monthIdx + 1) % 12;
        } else {
          dnum = i - firstWeekday + 1;
        }

        const key = fmt(cellYear, cellMonth + 1, dnum);

        const num = document.createElement('div');
        num.className = 'dnum';
        num.textContent = dnum;
        cell.appendChild(num);

        const todays = EVENTS.filter((ev) => ev.date === key);
        if (todays.length) {
          const chips = document.createElement('div');
          chips.className = 'chips';
          todays.forEach((ev) => {
            const chip = document.createElement('span');
            chip.className = `chip ${ev.cat}`;
            chip.textContent = ev.title;
            chips.appendChild(chip);
          });
          cell.appendChild(chips);
        }

        daysEl.appendChild(cell);
      }
    }

    document.querySelectorAll('.cal-nav').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dir = Number(btn.dataset.dir) || 0;
        view.setMonth(view.getMonth() + dir);
        renderCalendar();
      });
    });

    renderCalendar();
  }

  // ------------------ Host form confirmation ------------------
  const hostForm = document.getElementById('hostForm');
  const hostStatus = document.getElementById('hostStatus');
  const hostModal = document.getElementById('hostModal');
  const hostModalClose = document.getElementById('hostModalClose');
  const hostModalOk = document.getElementById('hostModalOk');
  const hostModalSummary = document.getElementById('hostModalSummary');
  const fieldType = document.getElementById('eventType');
  const fieldDate = document.getElementById('eventDate');
  const fieldGuests = document.getElementById('eventGuests');
  const fieldContact = document.getElementById('eventContact');
  const fieldNotes = document.getElementById('eventNotes');

  const closeModal = () => hostModal?.classList.remove('show');
  const openModal = () => {
    hostModal?.classList.add('show');
    if (hostStatus) {
      hostStatus.textContent = 'Reservation request sent. We will confirm shortly.';
      hostStatus.classList.add('show');
    }
    // Populate summary
    if (hostModalSummary) {
      const parts = [
        fieldType?.value && `Type: ${fieldType.value}`,
        fieldDate?.value && `Date: ${fieldDate.value}`,
        fieldGuests?.value && `Guests: ${fieldGuests.value}`,
        fieldContact?.value && `Contact: ${fieldContact.value}`,
        fieldNotes?.value && `Notes: ${fieldNotes.value}`,
      ].filter(Boolean);
      hostModalSummary.textContent = parts.join(' | ');
    }
    (hostModalClose || hostModalOk)?.focus();
  };

  hostModalClose?.addEventListener('click', closeModal);
  hostModalOk?.addEventListener('click', closeModal);
  hostModal?.addEventListener('click', (e) => {
    if (e.target === hostModal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  if (hostForm && hostStatus) {
    hostForm.addEventListener('submit', (e) => {
      e.preventDefault();
      openModal();
      setTimeout(() => hostStatus.classList.remove('show'), 4000);
    });
  }
})();
