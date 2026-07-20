/* Supabase glue shared by reviews.html, gallery.html and admin.html.
   The anon key is a public client token — RLS in supabase/schema.sql is what
   actually gates every read and write. */
(function () {
  var SUPABASE_URL = 'https://ahpdemhyqxcdgxqeyzot.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFocGRlbWh5cXhjZGd4cWV5em90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MDc2NjksImV4cCI6MjEwMDA4MzY2OX0.wbN1eIJzcEbuvmFmej-dFw6DsDLVI4wbFuuB2uierq0';

  window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  window.sbu = {
    esc: function (s) {
      var d = document.createElement('div');
      d.textContent = s == null ? '' : String(s);
      return d.innerHTML;
    },
    stars: function (n) {
      n = Math.max(1, Math.min(5, n | 0));
      return '<span class="stars" aria-label="' + n + ' out of 5 stars">' +
             '★★★★★'.slice(0, n) + '<i>' + '★★★★★'.slice(n) + '</i></span>';
    },
    when: function (iso) {
      try {
        return new Date(iso).toLocaleDateString('en-US',
          { year: 'numeric', month: 'long', day: 'numeric' });
      } catch (e) { return ''; }
    },
    img: function (path) {
      return SUPABASE_URL + '/storage/v1/object/public/gallery/' +
             encodeURIComponent(path).replace(/%2F/g, '/');
    }
  };
})();
