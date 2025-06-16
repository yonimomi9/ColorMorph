(function () {
  const domain = window.location.hostname;

  window.applyColorMorphTheme = () => {
    chrome.storage.local.get([domain], (result) => {
      const theme = result[domain];
      if (!theme || !theme.enabled) return;

      const primary = theme.background;
      const text = theme.text;

      const mid = window.adjustColorBrightness(primary, -10);
      const soft = window.adjustColorBrightness(primary, 15);

      const css = `
        html, body, main, section, article {
          background-color: ${primary} !important;
          color: ${text} !important;
        }

        header, nav, aside, footer {
          background-color: ${soft} !important;
          color: ${text} !important;
        }

        .sidebar, [class*="sidebar"], [class*="SideBar"], [class*="side-bar"] {
          background-color: ${soft} !important;
          color: ${text} !important;
        }

        .toolbar, [class*="Toolbar"], [class*="toolbar"] {
          background-color: ${mid} !important;
          color: ${text} !important;
        }

        div, span, p, a, li, td, th, strong, em, b, label,
        input, button, textarea, select, summary {
          color: ${text} !important;
          border-color: ${text} !important;
          caret-color: ${text} !important;
        }

        a {
          color: ${text} !important;
        }

        img, video, iframe, svg, canvas {
          filter: brightness(0.9) !important;
        }
      `;

      const existing = document.getElementById('colormorph-style');
      if (existing) existing.remove();

      const styleTag = document.createElement('style');
      styleTag.id = 'colormorph-style';
      styleTag.innerText = css;
      document.head.appendChild(styleTag);
    });
  };

  // Debounce utility: delays execution to prevent spammy calls
  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  const debouncedApplyTheme = debounce(() => {
    console.log("Reapplying theme due to DOM changes");
    window.applyColorMorphTheme();
  }, 300);

  // הפעלה מידית בהטענת הדף
  window.applyColorMorphTheme();

  // האזנה לשינויים ב-DOM עם debounce כדי למנוע קריסה
  const observer = new MutationObserver(debouncedApplyTheme);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
  });

})();
