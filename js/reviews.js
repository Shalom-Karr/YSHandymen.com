/* Reviews page: list approved reviews, take new submissions (arrive unapproved). */
(function () {
  var list = document.querySelector('#reviews-list');
  var form = document.querySelector('#review-form');
  if (!list || !form) return;

  function render(rows) {
    if (!rows.length) {
      list.innerHTML =
        '<div class="reviews-empty">' +
        '<p><strong>No reviews yet — yours could be the first.</strong></p>' +
        '<p>Had work done by Y.S. Handymen? Tell your neighbors how it went below.</p>' +
        '</div>';
      return;
    }
    list.innerHTML = rows.map(function (r) {
      return '<article class="review-card">' +
        sbu.stars(r.rating) +
        '<blockquote>' + sbu.esc(r.body) + '</blockquote>' +
        '<footer><strong>' + sbu.esc(r.name) + '</strong>' +
        (r.location ? '<span> · ' + sbu.esc(r.location) + '</span>' : '') +
        '<time datetime="' + sbu.esc(r.created_at) + '">' + sbu.when(r.created_at) + '</time>' +
        '</footer></article>';
    }).join('');
  }

  sb.from('reviews')
    .select('name, location, rating, body, created_at')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(60)
    .then(function (res) {
      if (res.error) {
        list.innerHTML = '<div class="reviews-empty"><p>Reviews are taking a moment to load. ' +
          'Please refresh, or just <a href="tel:+18482619922">call us</a>.</p></div>';
        return;
      }
      render(res.data || []);
    });

  var status = form.querySelector('.form-status');
  function show(msg, kind) {
    status.textContent = msg;
    status.className = 'form-status is-shown ' + kind;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.querySelector('[name="botcheck"]').checked) return;

    var rating = form.querySelector('[name="rating"]:checked');
    var v = {
      name: form.querySelector('#rv-name').value.trim(),
      location: form.querySelector('#rv-location').value.trim() || null,
      rating: rating ? parseInt(rating.value, 10) : 0,
      body: form.querySelector('#rv-body').value.trim()
    };
    if (!v.name || !v.rating || v.body.length < 10) {
      show('Please add your name, a star rating, and a few words about the job.', 'err');
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    sb.from('reviews').insert(v).then(function (res) {
      btn.disabled = false;
      if (res.error) {
        show('Something went wrong sending your review — please try again in a minute.', 'err');
        return;
      }
      form.reset();
      show('Thank you! Your review has been received and will appear once it’s been checked.', 'ok');
    });
  });
})();
