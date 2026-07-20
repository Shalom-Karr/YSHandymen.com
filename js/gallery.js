/* Gallery page: before/after projects straight from the database. */
(function () {
  var grid = document.querySelector('#gallery-grid');
  if (!grid) return;

  sb.from('gallery')
    .select('title, description, before_path, after_path, created_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .then(function (res) {
      if (res.error) {
        grid.innerHTML = '<div class="reviews-empty"><p>The gallery is taking a moment to load — ' +
          'please refresh the page.</p></div>';
        return;
      }
      var rows = res.data || [];
      if (!rows.length) {
        grid.innerHTML =
          '<div class="reviews-empty">' +
          '<p><strong>Project photos are on their way.</strong></p>' +
          '<p>In the meantime, <a href="services.html">see what we do</a> or ' +
          '<a href="tel:+18482619922">call 848-261-9922</a> to talk about your job.</p>' +
          '</div>';
        return;
      }
      grid.innerHTML = rows.map(function (g) {
        return '<article class="ba-card">' +
          '<div class="ba-pair">' +
          '<figure><span class="ba-tag">Before</span>' +
          '<img src="' + sbu.img(g.before_path) + '" alt="Before: ' + sbu.esc(g.title) + '" loading="lazy"></figure>' +
          '<figure><span class="ba-tag ba-tag--after">After</span>' +
          '<img src="' + sbu.img(g.after_path) + '" alt="After: ' + sbu.esc(g.title) + '" loading="lazy"></figure>' +
          '</div>' +
          '<div class="ba-body"><h3>' + sbu.esc(g.title) + '</h3>' +
          (g.description ? '<p>' + sbu.esc(g.description) + '</p>' : '') +
          '</div></article>';
      }).join('');
    });
})();
