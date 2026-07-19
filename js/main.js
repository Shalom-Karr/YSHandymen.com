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

  /* ---------- contact form ----------------------------------------------------
     Submissions are delivered by Web3Forms (https://web3forms.com) — free tier,
     250 submissions/month, no account or server needed. Comfortably covers the
     expected ~5/day.

     TO ACTIVATE (one minute, free):
       1. Go to https://web3forms.com
       2. Enter yshandymen@gmail.com — an access key is emailed straight back
       3. Paste that key into WEB3FORMS_KEY below and redeploy

     Until a key is set, the form falls back to a pre-filled mailto: handoff so
     the site still works. Nothing here exposes a secret — the access key is a
     public submission token, safe to commit. */
  var WEB3FORMS_KEY = '';   // <-- paste the access key here

  var form = document.querySelector('#quote-form');
  if (form) {
    var status = form.querySelector('.form-status');
    var submit = form.querySelector('button[type="submit"]');

    var show = function (msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form-status is-shown ' + kind;
    };

    var collect = function () {
      var d = new FormData(form);
      return {
        name:  (d.get('name')    || '').toString().trim(),
        phone: (d.get('phone')   || '').toString().trim(),
        email: (d.get('email')   || '').toString().trim(),
        job:   (d.get('job')     || '').toString().trim(),
        msg:   (d.get('message') || '').toString().trim(),
        trap:  (d.get('botcheck')|| '').toString()
      };
    };

    var mailtoFallback = function (v) {
      var body = [
        'Name:    ' + v.name,
        'Phone:   ' + v.phone,
        'Email:   ' + (v.email || '—'),
        'Service: ' + (v.job || 'General handyman work'),
        '', v.msg
      ].join('\n');
      window.location.href = 'mailto:yshandymen@gmail.com'
        + '?subject=' + encodeURIComponent('Website enquiry — ' + (v.job || 'Handyman work') + ' — ' + v.name)
        + '&body='    + encodeURIComponent(body);
      show('Opening your email app with the details filled in. If nothing happens, '
         + 'call 848-261-9922 or email yshandymen@gmail.com directly.', 'ok');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = collect();

      if (v.trap) return;                         // honeypot tripped — silently drop
      if (!v.name || !v.phone || !v.msg) {
        show('Please fill in your name, phone number and a short description of the job.', 'err');
        return;
      }

      if (!WEB3FORMS_KEY) { mailtoFallback(v); form.reset(); return; }

      submit.disabled = true;
      var label = submit.textContent;
      submit.textContent = 'Sending…';

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: 'Website enquiry — ' + (v.job || 'Handyman work') + ' — ' + v.name,
          from_name: 'Y.S. Handymen website',
          name: v.name,
          phone: v.phone,
          email: v.email || 'not supplied',
          service: v.job || 'General handyman work',
          message: v.msg
        })
      })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        if (r.success) {
          show('Thanks — your request has been sent. We\'ll get back to you shortly. '
             + 'For anything urgent, call 848-261-9922.', 'ok');
          form.reset();
        } else {
          show('Something went wrong sending that. Please call 848-261-9922 or '
             + 'email yshandymen@gmail.com.', 'err');
        }
      })
      .catch(function () {
        show('Couldn\'t reach the server. Please call 848-261-9922 or email '
           + 'yshandymen@gmail.com.', 'err');
      })
      .finally(function () {
        submit.disabled = false;
        submit.textContent = label;
      });
    });
  }
})();
