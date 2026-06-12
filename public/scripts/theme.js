(function() {
  function applyThemeAndHue() {
    var theme = localStorage.getItem('theme');
    if (theme === 'dark' || theme === 'light') {
      document.documentElement.dataset.theme = theme;
    } else {
      var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    }
    var hue = localStorage.getItem('hue') || '155';
    document.documentElement.style.setProperty('--hue', hue);
  }
  applyThemeAndHue();
  document.addEventListener('astro:after-swap', applyThemeAndHue);

  // Listen to system preference changes dynamically
  var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  function handleSystemThemeChange(e) {
    var theme = localStorage.getItem('theme');
    if (!theme || (theme !== 'dark' && theme !== 'light')) {
      document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
    }
  }
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleSystemThemeChange);
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(handleSystemThemeChange);
  }
})();
