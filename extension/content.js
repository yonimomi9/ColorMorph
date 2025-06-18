(function () {
  const domain = window.location.hostname;

  window.applyColorMorphTheme = () => {
    chrome.storage.local.get([domain], (result) => {
      const theme = result[domain];
      if (!theme || !theme.enabled) return;

      const bg = theme.background;
      const fg = theme.text;

      document.documentElement.classList.add("colormorph-theme");
      document.documentElement.style.setProperty('--colormorph-bg', bg);
      document.documentElement.style.setProperty('--colormorph-fg', fg);

      const existing = document.getElementById('colormorph-style');
      if (existing) existing.remove();

      const css = `
        :root {
          --colormorph-bg: ${bg};
          --colormorph-fg: ${fg};
        }

        html, body, main, section, article, aside, nav, header, footer,
        .sidebar, .SideBar, .side-bar, .toolbar, .Toolbar,
        div, span, p, a, li, td, th, strong, em, b, label,
        input, button, textarea, select, summary {
          background-color: var(--colormorph-bg) !important;
          color: var(--colormorph-fg) !important;
          border-color: var(--colormorph-fg) !important;
          caret-color: var(--colormorph-fg) !important;
        }

        a {
          color: var(--colormorph-fg) !important;
        }

        img, video, iframe, svg, canvas {
          filter: brightness(0.95) !important;
        }
      `;

      const style = document.createElement('style');
      style.id = 'colormorph-style';
      style.textContent = css;
      document.head.appendChild(style);
    });
  };

  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  const debouncedApplyTheme = debounce(() => {
    console.log("[ColorMorph] Reapplying theme on DOM mutation");
    window.applyColorMorphTheme();
  }, 200);

  window.applyColorMorphTheme();

  const observer = new MutationObserver(debouncedApplyTheme);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true
  });
})();
