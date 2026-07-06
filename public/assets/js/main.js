// At Home In Leander — navigation behavior
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('primary-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Mobile: tap a parent item to expand its submenu instead of navigating
  if (menu) {
    menu.querySelectorAll('.has-sub > a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (window.matchMedia('(max-width: 820px)').matches) {
          var li = link.parentElement;
          // Only intercept the first tap; allow real navigation on a second tap.
          if (!li.classList.contains('expand')) {
            e.preventDefault();
            li.classList.toggle('expand');
          }
        }
      });
    });
  }

  // Close mobile menu when a real link is followed
  if (menu) {
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (!a.parentElement.classList.contains('has-sub')) {
          menu.classList.remove('open');
        }
      });
    });
  }
})();
