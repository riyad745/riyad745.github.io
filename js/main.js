(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle ---------- */
  var themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', next === 'light' ? '#f7f8fb' : '#07080c');
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navLinks.classList.toggle('is-open', open);
  }
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---------- Scroll: nav state, progress bar, back-to-top ---------- */
  var nav = document.getElementById('nav');
  var progress = document.getElementById('progress');
  var toTop = document.getElementById('toTop');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('is-scrolled', y > 20);
    toTop.classList.toggle('is-visible', y > 600);
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Active nav link ---------- */
  var links = Array.prototype.slice.call(navLinks.querySelectorAll('a'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { if (s) spy.observe(s); });
  }

  /* ---------- Reveal on scroll + stat counters ---------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var start = null;
    var dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var reveals = document.querySelectorAll('.reveal');
  // Stagger siblings that share a parent
  reveals.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('reveal'); });
    var i = siblings.indexOf(el);
    if (i > 0) el.style.setProperty('--d', Math.min(i * 0.08, 0.5) + 's');
  });

  function show(el) {
    el.classList.add('is-visible');
    var counter = el.querySelector('[data-count]');
    if (counter) countUp(counter);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { show(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(show);
  }

  /* ---------- Typed roles ---------- */
  var typed = document.getElementById('typed');
  var words = ['mobile apps', 'Flutter apps', 'iOS & Android apps', 'scalable products', 'delightful UX'];
  if (!reduceMotion) {
    var wi = 0, ci = words[0].length, deleting = true;
    (function tick() {
      var word = words[wi];
      ci += deleting ? -1 : 1;
      typed.textContent = word.slice(0, ci);
      var delay = deleting ? 45 : 85;
      if (!deleting && ci === word.length) { deleting = true; delay = 1800; }
      else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 300; }
      setTimeout(tick, delay);
    })();
  }

  /* ---------- Portrait tilt ---------- */
  var portrait = document.getElementById('portrait');
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    var hero = document.querySelector('.hero');
    hero.addEventListener('mousemove', function (e) {
      var r = portrait.getBoundingClientRect();
      var x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      var y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      portrait.style.transform = 'perspective(900px) rotateY(' + (x * 14) + 'deg) rotateX(' + (-y * 14) + 'deg)';
    });
    hero.addEventListener('mouseleave', function () { portrait.style.transform = ''; });
  }

  /* ---------- Resume tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !active;
    });
    var panel = document.getElementById(tab.getAttribute('aria-controls'));
    panel.querySelectorAll('.t-item').forEach(function (item, i) {
      item.classList.remove('pop');
      void item.offsetWidth;
      item.style.animationDelay = (i * 0.06) + 's';
      item.classList.add('pop');
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      selectTab(next);
    });
  });

  /* ---------- Project filters ---------- */
  var filters = document.querySelectorAll('.filter');
  var projects = document.querySelectorAll('.project');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      var n = 0;
      projects.forEach(function (p) {
        var match = f === 'all' || p.getAttribute('data-cat') === f;
        p.classList.toggle('is-hidden', !match);
        p.classList.remove('pop');
        if (match) {
          void p.offsetWidth;
          p.style.animationDelay = (n++ * 0.05) + 's';
          p.classList.add('pop');
        }
      });
    });
  });

  /* ---------- Contact form -> opens the visitor's email app ---------- */
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  var fields = form.elements;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      subject: fields.subject.value.trim(),
      message: fields.message.value.trim()
    };
    var bad = [];
    if (!data.name) bad.push(fields.name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) bad.push(fields.email);
    if (!data.message) bad.push(fields.message);
    form.querySelectorAll('.field').forEach(function (f) { f.classList.remove('has-error'); });
    bad.forEach(function (el) { el.closest('.field').classList.add('has-error'); });
    if (bad.length) {
      note.className = 'form__note is-error';
      note.textContent = 'Please fill in your name, a valid email and a message.';
      bad[0].focus();
      return;
    }
    var subject = data.subject || ('Project enquiry from ' + data.name);
    var body = data.message + '\n\n— ' + data.name + ' (' + data.email + ')';
    window.location.href = 'mailto:mohammadriyad9090@gmail.com?subject=' +
      encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    note.className = 'form__note is-ok';
    note.textContent = 'Opening your email app… Thanks for reaching out!';
  });

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
