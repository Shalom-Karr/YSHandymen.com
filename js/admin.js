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
        '<blockquote>' + sbu.esc(r.body) + '</blockquote>' +
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
        if (el.querySelector('.adm-edit')) return;
        var wrap = document.createElement('div');
        wrap.className = 'adm-edit';
        wrap.innerHTML =
          '<label>Name<input type="text" data-f-name maxlength="80"></label>' +
          '<label>Neighborhood<input type="text" data-f-location maxlength="80" placeholder="Optional"></label>' +
          '<label>Rating<select data-f-rating>' +
            [5, 4, 3, 2, 1].map(function (n) {
              return '<option value="' + n + '">' + n + ' star' + (n > 1 ? 's' : '') + '</option>';
            }).join('') +
          '</select></label>' +
          '<label>Review<textarea data-f-body rows="4" maxlength="1200"></textarea></label>' +
          '<div class="btn-row">' +
          '<button class="btn btn--sm" data-save>Save</button>' +
          '<button class="btn btn--sm btn--ghost2" data-cancel>Cancel</button>' +
          '</div><p class="adm-note" data-err></p>';
        wrap.querySelector('[data-f-name]').value = r.name;
        wrap.querySelector('[data-f-location]').value = r.location || '';
        wrap.querySelector('[data-f-rating]').value = String(r.rating);
        wrap.querySelector('[data-f-body]').value = r.body;

        el.querySelector('.adm-actions').style.display = 'none';
        el.appendChild(wrap);

        wrap.querySelector('[data-cancel]').addEventListener('click', loadReviews);
        wrap.querySelector('[data-save]').addEventListener('click', function () {
          var v = {
            name: wrap.querySelector('[data-f-name]').value.trim(),
            location: wrap.querySelector('[data-f-location]').value.trim() || null,
            rating: parseInt(wrap.querySelector('[data-f-rating]').value, 10),
            body: wrap.querySelector('[data-f-body]').value.trim()
          };
          if (v.name.length < 2 || v.body.length < 10) {
            wrap.querySelector('[data-err]').textContent =
              'Name needs at least 2 characters and the review at least 10.';
            return;
          }
          sb.from('reviews').update(v).eq('id', r.id).then(function (res) {
            if (res.error) { wrap.querySelector('[data-err]').textContent = 'Save failed: ' + res.error.message; return; }
            loadReviews();
          });
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

  function ext(file) {
    var m = /\.(jpe?g|png|webp)$/i.exec(file.name);
    return m ? m[0].toLowerCase() : '.jpg';
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
        '<button class="btn btn--sm btn--ghost2" data-edit>Edit</button>' +
        '<button class="btn btn--sm btn--danger" data-delete>Delete</button>' +
        '</div></div>';
    }).join('');

    rows.forEach(function (g) {
      var el = galList.querySelector('[data-id="' + g.id + '"]');

      el.querySelector('[data-delete]').addEventListener('click', function () {
        if (!confirm('Delete this project and its photos?')) return;
        sb.storage.from('gallery').remove([g.before_path, g.after_path])
          .then(function () { return sb.from('gallery').delete().eq('id', g.id); })
          .then(function (res) { if (!res.error) loadGallery(); });
      });

      el.querySelector('[data-edit]').addEventListener('click', function () {
        if (el.querySelector('.adm-edit')) return;
        var wrap = document.createElement('div');
        wrap.className = 'adm-edit';
        wrap.innerHTML =
          '<label>Title<input type="text" data-f-title maxlength="120"></label>' +
          '<label>Description<input type="text" data-f-desc maxlength="600" placeholder="Optional"></label>' +
          '<label>Replace before photo<input type="file" data-f-before accept="image/jpeg,image/png,image/webp"></label>' +
          '<label>Replace after photo<input type="file" data-f-after accept="image/jpeg,image/png,image/webp"></label>' +
          '<p class="adm-note">Leave a photo empty to keep the current one.</p>' +
          '<div class="btn-row">' +
          '<button class="btn btn--sm" data-save>Save</button>' +
          '<button class="btn btn--sm btn--ghost2" data-cancel>Cancel</button>' +
          '</div><p class="adm-note" data-err></p>';
        wrap.querySelector('[data-f-title]').value = g.title;
        wrap.querySelector('[data-f-desc]').value = g.description || '';

        el.querySelector('.adm-actions').style.display = 'none';
        el.appendChild(wrap);

        wrap.querySelector('[data-cancel]').addEventListener('click', loadGallery);
        wrap.querySelector('[data-save]').addEventListener('click', function () {
          var title = wrap.querySelector('[data-f-title]').value.trim();
          var desc = wrap.querySelector('[data-f-desc]').value.trim() || null;
          var newBefore = wrap.querySelector('[data-f-before]').files[0] || null;
          var newAfter = wrap.querySelector('[data-f-after]').files[0] || null;
          var err = wrap.querySelector('[data-err]');
          if (title.length < 2) { err.textContent = 'A title is required.'; return; }

          var saveBtn = wrap.querySelector('[data-save]');
          saveBtn.disabled = true;
          err.textContent = (newBefore || newAfter) ? 'Uploading…' : '';

          var stamp = Date.now();
          var patch = { title: title, description: desc };
          var uploaded = [];
          var replaced = [];

          function uploadIf(file, label, oldPath) {
            if (!file) return Promise.resolve();
            var path = stamp + '-' + label + ext(file);
            return sb.storage.from('gallery').upload(path, file).then(function (r) {
              if (r.error) throw r.error;
              uploaded.push(path);
              replaced.push(oldPath);
              patch[label + '_path'] = path;
            });
          }

          uploadIf(newBefore, 'before', g.before_path)
            .then(function () { return uploadIf(newAfter, 'after', g.after_path); })
            .then(function () { return sb.from('gallery').update(patch).eq('id', g.id); })
            .then(function (res) {
              if (res.error) throw res.error;
              if (replaced.length) sb.storage.from('gallery').remove(replaced);
              loadGallery();
            })
            .catch(function (e2) {
              saveBtn.disabled = false;
              err.textContent = 'Save failed: ' + (e2.message || e2);
              if (uploaded.length) sb.storage.from('gallery').remove(uploaded);
            });
        });
      });
    });
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
