/* Чакыруу — Эркинбектин 50 жылдык мааракеси */
(function () {
  'use strict';

  var TOI = new Date('2026-11-21T17:00:00+06:00'); // Бишкек, UTC+6
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────
     Длина линий: чтобы орнамент «вышивался»
     ровно по своей длине, а не наугад
     ───────────────────────────────────────── */
  function measure() {
    document.querySelectorAll('.medal__circle, .vine__stem, .gate__rect').forEach(function (el) {
      try { el.style.setProperty('--len', Math.ceil(el.getTotalLength())); } catch (e) {}
    });

    // <use> не умеет getTotalLength — меряем исходный путь
    var cache = {};
    document.querySelectorAll('use').forEach(function (u) {
      var id = (u.getAttribute('href') || u.getAttribute('xlink:href') || '').slice(1);
      if (!id) return;
      if (!(id in cache)) {
        var src = document.getElementById(id);
        var p = src && src.querySelector('path');
        cache[id] = p ? Math.ceil(p.getTotalLength()) : 200;
      }
      u.style.setProperty('--len', cache[id]);
    });
  }

  /* ─────────────────────────────────────────
     Календарь: ноябрь 2026, неделя с дүйшөмбү
     ───────────────────────────────────────── */
  function buildCalendar() {
    var grid = document.getElementById('calGrid');
    if (!grid) return;

    var year = 2026, month = 10, marked = 21; // month: 0-индекс, 10 = ноябрь
    var days = new Date(year, month + 1, 0).getDate();
    var first = new Date(year, month, 1).getDay();      // 0 = жекшемби
    var lead = (first + 6) % 7;                          // сдвиг под пн-первый
    var frag = document.createDocumentFragment();

    for (var i = 0; i < lead; i++) {
      frag.appendChild(document.createElement('span'));
    }
    for (var d = 1; d <= days; d++) {
      var cell = document.createElement('span');
      cell.textContent = d;
      if ((lead + d - 1) % 7 === 6) cell.className = 'is-sun';
      if (d === marked) {
        cell.className = 'is-day';
        cell.setAttribute('aria-current', 'date');
      }
      frag.appendChild(cell);
    }
    grid.appendChild(frag);
  }

  /* ─────────────────────────────────────────
     Таймер обратного отсчёта
     ───────────────────────────────────────── */
  function startCountdown() {
    var out = {
      d: document.getElementById('cDays'),
      h: document.getElementById('cHours'),
      m: document.getElementById('cMins'),
      s: document.getElementById('cSecs')
    };
    var done = document.getElementById('countDone');
    var box = document.getElementById('count');
    if (!out.d) return;

    function put(el, val) {
      var txt = val < 10 ? '0' + val : String(val);
      if (el.textContent === txt) return;
      el.textContent = txt;
      if (calm) return;
      el.classList.remove('is-tick');
      void el.offsetWidth;          // перезапуск анимации
      el.classList.add('is-tick');
    }

    function tick() {
      var left = TOI - Date.now();

      if (left <= 0) {
        if (box) box.hidden = true;
        if (done) done.hidden = false;
        clearInterval(timer);
        return;
      }
      var sec = Math.floor(left / 1000);
      put(out.d, Math.floor(sec / 86400));
      put(out.h, Math.floor(sec / 3600) % 24);
      put(out.m, Math.floor(sec / 60) % 60);
      put(out.s, sec % 60);
    }

    tick();
    var timer = setInterval(tick, 1000);
  }

  /* ─────────────────────────────────────────
     Появление секций при прокрутке
     ───────────────────────────────────────── */
  function watchReveals() {
    var items = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ─────────────────────────────────────────
     Музыка: стартует по первому касанию,
     громкость нарастает плавно
     ───────────────────────────────────────── */
  var audio = document.getElementById('audio');
  var muteBtn = document.getElementById('muteBtn');
  var TARGET_VOL = 0.32;
  var fader;

  function fadeTo(to, ms) {
    clearInterval(fader);
    var from = audio.volume, steps = Math.max(1, Math.round(ms / 40)), i = 0;
    fader = setInterval(function () {
      i++;
      audio.volume = Math.min(1, Math.max(0, from + (to - from) * (i / steps)));
      if (i >= steps) clearInterval(fader);
    }, 40);
  }

  function playMusic() {
    if (!audio) return;
    audio.volume = 0;
    var p = audio.play();
    if (p && p.catch) {
      p.then(function () { fadeTo(TARGET_VOL, 2600); })
       .catch(function () { if (muteBtn) muteBtn.setAttribute('aria-pressed', 'true'); });
    } else {
      fadeTo(TARGET_VOL, 2600);
    }
  }

  if (muteBtn && audio) {
    muteBtn.addEventListener('click', function () {
      var off = muteBtn.getAttribute('aria-pressed') === 'true';
      if (off) {
        audio.play().then(function () { fadeTo(TARGET_VOL, 700); }).catch(function () {});
        muteBtn.setAttribute('aria-pressed', 'false');
        muteBtn.setAttribute('aria-label', 'Музыканы өчүрүү');
      } else {
        fadeTo(0, 500);
        setTimeout(function () {
          if (muteBtn.getAttribute('aria-pressed') === 'true') audio.pause();
        }, 560);
        muteBtn.setAttribute('aria-pressed', 'true');
        muteBtn.setAttribute('aria-label', 'Музыканы күйгүзүү');
      }
    });
  }

  /* ─────────────────────────────────────────
     Открытие приглашения
     ───────────────────────────────────────── */
  function openInvite() {
    var gate = document.getElementById('gate');
    var btn = document.getElementById('gateBtn');
    if (!gate || !btn) return;

    btn.addEventListener('click', function once() {
      btn.removeEventListener('click', once);

      playMusic();
      gate.classList.add('is-gone');
      document.body.classList.remove('is-locked');
      document.body.classList.add('is-open');
      if (muteBtn) muteBtn.hidden = false;

      window.scrollTo(0, 0);
      setTimeout(function () { gate.remove(); }, 1000);
    });
  }

  /* ───────────────────────────────────────── */
  function init() {
    measure();
    buildCalendar();
    startCountdown();
    watchReveals();
    openInvite();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // шрифты меняют метрику — пересчитать длины после их загрузки
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measure);
  }
})();
