/* Y.S. Handymen — site behaviour. Vanilla, no dependencies. */
(function () {
  'use strict';

  /* ---------- mobile drawer ---------- */
  var burger = document.querySelector('.burger');
  var drawer = document.querySelector('.drawer');
  var scrim  = document.querySelector('.scrim');

  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    scrim.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (burger) {
    burger.addEventListener('click', function () {
      setDrawer(burger.getAttribute('aria-expanded') !== 'true');
    });
    scrim.addEventListener('click', function () { setDrawer(false); });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setDrawer(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setDrawer(false);
    });
  }

  /* ---------- sticky header shadow ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if (!('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- current year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- contact form ----------
     No backend is wired up. The form hands off to the visitor's mail client
     with the enquiry pre-filled, so it works on plain static hosting.
     Swap `handoffToEmail` for a real endpoint (Formspree, Netlify, Worker)
     when one is available — see README. */
  var form = document.querySelector('#quote-form');
  if (form) {
    var status = form.querySelector('.form-status');

    var show = function (msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form-status is-shown ' + kind;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = new FormData(form);
      var name  = (data.get('name')  || '').toString().trim();
      var phone = (data.get('phone') || '').toString().trim();
      var email = (data.get('email') || '').toString().trim();
      var job   = (data.get('job')   || '').toString().trim();
      var msg   = (data.get('message') || '').toString().trim();

      if (!name || !phone || !msg) {
        show('Please fill in your name, phone number and a short description of the job.', 'err');
        return;
      }

      var lines = [
        'Name:    ' + name,
        'Phone:   ' + phone,
        'Email:   ' + (email || '—'),
        'Service: ' + (job || 'General handyman work'),
        '',
        msg
      ];

      var href = 'mailto:yshandymen@gmail.com'
        + '?subject=' + encodeURIComponent('Website enquiry — ' + (job || 'Handyman work') + ' — ' + name)
        + '&body='    + encodeURIComponent(lines.join('\n'));

      window.location.href = href;
      show('Opening your email app with the details filled in. If nothing happens, call 848-261-9922 or email yshandymen@gmail.com directly.', 'ok');
      form.reset();
    });
  }
})();
