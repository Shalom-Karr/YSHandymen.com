/* Homepage social proof: show the three latest approved reviews, or stay
   hidden entirely if there are none. Uses plain fetch so the landing page
   doesn't pay for the Supabase client library. */
(function () {
  var section = document.querySelector('#home-reviews');
  if (!section) return;

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }
  function stars(n) {
    n = Math.max(1, Math.min(5, n | 0));
    return '<span class="stars" aria-label="' + n + ' out of 5 stars">' +
           '★★★★★'.slice(0, n) + '<i>' + '★★★★★'.slice(n) + '</i></span>';
  }

  fetch('https://ahpdemhyqxcdgxqeyzot.supabase.co/rest/v1/reviews' +
        '?select=name,location,rating,body&approved=eq.true&order=created_at.desc&limit=3', {
    headers: { apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFocGRlbWh5cXhjZGd4cWV5em90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MDc2NjksImV4cCI6MjEwMDA4MzY2OX0.wbN1eIJzcEbuvmFmej-dFw6DsDLVI4wbFuuB2uierq0' }
  }).then(function (r) { return r.ok ? r.json() : []; })
    .then(function (rows) {
      if (!rows || !rows.length) return;
      section.querySelector('#home-reviews-list').innerHTML = rows.map(function (r) {
        return '<article class="review-card">' +
          stars(r.rating) +
          '<blockquote>' + esc(r.body) + '</blockquote>' +
          '<footer><strong>' + esc(r.name) + '</strong>' +
          (r.location ? '<span> · ' + esc(r.location) + '</span>' : '') +
          '</footer></article>';
      }).join('');
      section.style.display = '';
    })
    .catch(function () { /* stay hidden */ });
})();
