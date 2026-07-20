/* Admin console: Supabase Auth sign-in, review moderation, gallery management.
   Admin rights come from the admins table via the is_admin() RPC — being
   signed in alone grants nothing (RLS enforces the same rule server-side). */
(function () {
  var loginView = document.querySelector('#login-view');
  var deniedView = document.querySelector('#denied-view');
  var adminView = document.querySelector('#admin-view');
  if (!loginView) return;

  function only(view) {
    [loginView, deniedView, adminView].forEach(function (v) {
      v.style.display = (v === view) ? '' : 'none';
    });
  }

  // ---------------------------------------------------------------- auth
  var loginForm = document.querySelector('#login-form');
  var loginStatus = loginForm.querySelector('.form-status');

  function loginMsg(msg, kind) {
    loginStatus.textContent = msg;
    loginStatus.className = 'form-status is-shown ' + kind;
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = loginForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    sb.auth.signInWithPassword({
      email: loginForm.querySelector('#adm-email').value.trim(),
      password: loginForm.querySelector('#adm-pass').value
    }).then(function (res) {
      btn.disabled = false;
      if (res.error) { loginMsg('Sign-in failed: ' + res.error.message, 'err'); return; }
      route();
    });
  });

  document.querySelectorAll('[data-signout]').forEach(function (b) {
    b.addEventListener('click', function () {
      sb.auth.signOut().then(route);
    });
  });

  function route() {
    sb.auth.getSession().then(function (res) {
      var session = res.data && res.data.session;
      if (!session) { only(loginView); return; }
      sb.rpc('is_admin').then(function (r) {
        if (r.error || !r.data) {
          document.querySelector('#denied-who').textContent = session.user.email;
          only(deniedView);
          return;
        }
        document.querySelector('#admin-who').textContent = session.user.email;
        only(adminView);
        loadReviews();
        loadGallery();
      });
    });
  }

  // ------------------------------------------------------------- reviews
  var revList = document.querySelector('#adm-reviews');

  function loadReviews() {
    revList.innerHTML = '<p class="adm-note">Loading reviews…</p>';
    sb.from('reviews').select('*')
      .order('approved', { ascending: true })
      .order('created_at', { ascending: false })
      .then(function (res) {
        if (res.error) { revList.innerHTML = '<p class="adm-note">Could not load reviews: ' + sbu.esc(res.error.message) + '</p>'; return; }
        renderReviews(res.data || []);
      });
  }

  function renderReviews(rows) {
    if (!rows.length) { revList.innerHTML = '<p class="adm-note">No reviews yet.</p>'; return; }
    revList.innerHTML = rows.map(function (r) {
      return '<div class="adm-row" data-id="' + r.id + '">' +
        '<div class="adm-row__head">' +
        sbu.stars(r.rating) +
        '<span class="badge ' + (r.approved ? 'badge--live' : 'badge--pending') + '">' +
        (r.approved ? 'Live' : 'Pending') + '</span>' +
        '</div>' +
        '<blockquote data-body>' + sbu.esc(r.body) + '</blockquote>' +
        '<p class="adm-meta"><strong>' + sbu.esc(r.name) + '</strong>' +
        (r.location ? ' · ' + sbu.esc(r.location) : '') + ' · ' + sbu.when(r.created_at) + '</p>' +
        '<div class="btn-row adm-actions">' +
        '<button class="btn btn--sm" data-approve>' + (r.approved ? 'Unpublish' : 'Approve') + '</button>' +
        '<button class="btn btn--sm btn--ghost2" data-edit>Edit</button>' +
        '<button class="btn btn--sm btn--danger" data-delete>Delete</button>' +
        '</div></div>';
    }).join('');

    rows.forEach(function (r) {
      var el = revList.querySelector('[data-id="' + r.id + '"]');

      el.querySelector('[data-approve]').addEventListener('click', function () {
        sb.from('reviews').update({ approved: !r.approved }).eq('id', r.id)
          .then(function (res) { if (!res.error) loadReviews(); });
      });

      el.querySelector('[data-delete]').addEventListener('click', function () {
        if (!confirm('Delete this review permanently?')) return;
        sb.from('reviews').delete().eq('id', r.id)
          .then(function (res) { if (!res.error) loadReviews(); });
      });

      el.querySelector('[data-edit]').addEventListener('click', function () {
        var q = el.querySelector('[data-body]');
        if (el.querySelector('textarea')) return;
        var ta = document.createElement('textarea');
        ta.value = r.body;
        ta.rows = 4;
        q.replaceWith(ta);
        var save = document.createElement('button');
        save.className = 'btn btn--sm';
        save.textContent = 'Save';
        var cancel = document.createElement('button');
        cancel.className = 'btn btn--sm btn--ghost2';
        cancel.textContent = 'Cancel';
        var actions = el.querySelector('.adm-actions');
        actions.style.display = 'none';
        actions.after(save, cancel);
        cancel.addEventListener('click', loadReviews);
        save.addEventListener('click', function () {
          var body = ta.value.trim();
          if (body.length < 10) return;
          sb.from('reviews').update({ body: body }).eq('id', r.id)
            .then(function (res) { if (!res.error) loadReviews(); });
        });
      });
    });
  }

  // ------------------------------------------------------------- gallery
  var galList = document.querySelector('#adm-gallery');
  var galForm = document.querySelector('#gallery-form');
  var galStatus = galForm.querySelector('.form-status');

  function galMsg(msg, kind) {
    galStatus.textContent = msg;
    galStatus.className = 'form-status is-shown ' + kind;
  }

  function loadGallery() {
    galList.innerHTML = '<p class="adm-note">Loading gallery…</p>';
    sb.from('gallery').select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .then(function (res) {
        if (res.error) { galList.innerHTML = '<p class="adm-note">Could not load gallery: ' + sbu.esc(res.error.message) + '</p>'; return; }
        renderGallery(res.data || []);
      });
  }

  function renderGallery(rows) {
    if (!rows.length) { galList.innerHTML = '<p class="adm-note">No projects posted yet.</p>'; return; }
    galList.innerHTML = rows.map(function (g) {
      return '<div class="adm-row" data-id="' + g.id + '">' +
        '<div class="adm-thumbs">' +
        '<img src="' + sbu.img(g.before_path) + '" alt="Before" loading="lazy">' +
        '<img src="' + sbu.img(g.after_path) + '" alt="After" loading="lazy">' +
        '</div>' +
        '<p class="adm-meta"><strong>' + sbu.esc(g.title) + '</strong>' +
        (g.description ? ' — ' + sbu.esc(g.description) : '') + '</p>' +
        '<div class="btn-row adm-actions">' +
        '<button class="btn btn--sm btn--danger" data-delete>Delete</button>' +
        '</div></div>';
    }).join('');

    rows.forEach(function (g) {
      galList.querySelector('[data-id="' + g.id + '"] [data-delete]')
        .addEventListener('click', function () {
          if (!confirm('Delete this project and its photos?')) return;
          sb.storage.from('gallery').remove([g.before_path, g.after_path])
            .then(function () { return sb.from('gallery').delete().eq('id', g.id); })
            .then(function (res) { if (!res.error) loadGallery(); });
        });
    });
  }

  function ext(file) {
    var m = /\.(jpe?g|png|webp)$/i.exec(file.name);
    return m ? m[0].toLowerCase() : '.jpg';
  }

  galForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var title = galForm.querySelector('#gal-title').value.trim();
    var desc = galForm.querySelector('#gal-desc').value.trim() || null;
    var before = galForm.querySelector('#gal-before').files[0];
    var after = galForm.querySelector('#gal-after').files[0];
    if (!title || !before || !after) {
      galMsg('A title plus both a before and an after photo are required.', 'err');
      return;
    }
    var btn = galForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    galMsg('Uploading photos…', 'ok');

    var stamp = Date.now();
    var beforePath = stamp + '-before' + ext(before);
    var afterPath = stamp + '-after' + ext(after);

    sb.storage.from('gallery').upload(beforePath, before)
      .then(function (r1) {
        if (r1.error) throw r1.error;
        return sb.storage.from('gallery').upload(afterPath, after);
      })
      .then(function (r2) {
        if (r2.error) throw r2.error;
        return sb.from('gallery').insert({
          title: title, description: desc,
          before_path: beforePath, after_path: afterPath
        });
      })
      .then(function (r3) {
        if (r3.error) throw r3.error;
        btn.disabled = false;
        galForm.reset();
        galMsg('Project posted — it is live on the gallery page.', 'ok');
        loadGallery();
      })
      .catch(function (err) {
        btn.disabled = false;
        galMsg('Upload failed: ' + (err.message || err), 'err');
        sb.storage.from('gallery').remove([beforePath, afterPath]);
      });
  });

  route();
})();
