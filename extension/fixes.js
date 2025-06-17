(function () {
  const THEME_CLASSES = [
    'dark', 'light', 'modern-dark', 'modern-light',
    'theme-dark', 'theme-light'
  ];

  function adjust(hex, amount) {
    hex = hex.startsWith('#') ? hex.slice(1) : hex;
    const num = parseInt(hex, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  function removeNativeThemes() {
    THEME_CLASSES.forEach(cls => {
      document.documentElement.classList.remove(cls);
      document.body.classList.remove(cls);
    });
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');
    if (location.hostname.includes("youtube.com")) {
      document.documentElement.removeAttribute("dark");
      document.documentElement.removeAttribute("data-dark-theme");
      document.body.removeAttribute("dark");
      document.body.removeAttribute("data-dark-theme");
    }
  }

  function restoreNativeThemes() {
    if (location.hostname.includes("youtube.com")) {
      document.documentElement.setAttribute("dark", "");
      document.documentElement.setAttribute("data-dark-theme", "true");
      document.body.setAttribute("dark", "");
      document.body.setAttribute("data-dark-theme", "true");
    }
  }

  function applyToAllShadowRoots(styleElement) {
    const walk = (node) => {
      if (!node) return;
      if (node.shadowRoot) {
        try {
          node.shadowRoot.appendChild(styleElement.cloneNode(true));
        } catch (e) {
          console.warn("Couldn't inject style into shadowRoot:", node);
        }
      }
      Array.from(node.children).forEach(child => walk(child));
    };
    walk(document.body);
  }

  function applyColorMorphTheme() {
    chrome.storage.local.get([location.hostname], (result) => {
      const theme = result[location.hostname];
      const existing = document.getElementById("colormorph-style");
      if (existing) existing.remove();

      if (!theme || !theme.enabled) {
        document.documentElement.classList.remove("colormorph-theme");
        document.documentElement.style.removeProperty('--colormorph-bg');
        document.documentElement.style.removeProperty('--colormorph-fg');
        document.documentElement.style.removeProperty('--colormorph-soft');
        document.documentElement.style.removeProperty('--colormorph-card');
        document.documentElement.style.removeProperty('--colormorph-dark');
        document.documentElement.style.removeProperty('--colormorph-border');
        restoreNativeThemes();
        return;
      }

      removeNativeThemes();

      const soft = adjust(theme.background, 10);
      const card = adjust(theme.background, 5);
      const dark = adjust(theme.background, -20);
      const border = adjust(theme.background, -40);

      document.documentElement.classList.add("colormorph-theme");
      document.documentElement.style.setProperty('--colormorph-bg', theme.background);
      document.documentElement.style.setProperty('--colormorph-fg', theme.text);
      document.documentElement.style.setProperty('--colormorph-soft', soft);
      document.documentElement.style.setProperty('--colormorph-card', card);
      document.documentElement.style.setProperty('--colormorph-dark', dark);
      document.documentElement.style.setProperty('--colormorph-border', border);

      const css = `
        .colormorph-theme {
          --colormorph-bg: ${theme.background};
          --colormorph-fg: ${theme.text};
          --colormorph-soft: ${soft};
          --colormorph-card: ${card};
          --colormorph-dark: ${dark};
          --colormorph-border: ${border};
        }

        .colormorph-theme html, .colormorph-theme body {
          background-color: var(--colormorph-bg) !important;
          color: var(--colormorph-fg) !important;
        }

        .colormorph-theme header, nav, aside, footer,
        .colormorph-theme .sidebar, [class*="SideBar"], [class*="side-bar"] {
          background-color: var(--colormorph-soft) !important;
          color: var(--colormorph-fg) !important;
        }
      
        .colormorph-theme .card, [class*="Card"], article, section, .artdeco-card {
          background-color: var(--colormorph-card) !important;
          color: var(--colormorph-fg) !important;
          border-radius: 8px !important;
          border: 1px solid var(--colormorph-border) !important;
          padding: 12px !important;
        }

        .colormorph-theme button,
        .colormorph-theme input,
        .colormorph-theme textarea,
        .colormorph-theme select {
          background-color: var(--colormorph-dark) !important;
          color: var(--colormorph-fg) !important;
          border: 1px solid var(--colormorph-border) !important;
          border-radius: 6px !important;
        }

        .colormorph-theme a {
          color: var(--colormorph-fg) !important;
        }

        .colormorph-theme div[role="complementary"] {
          background-color: var(--colormorph-card) !important;
        }

        .colormorph-theme div[class*="footer"], footer {
          background-color: var(--colormorph-soft) !important;
        }

        .colormorph-theme * {
          border-color: var(--colormorph-border) !important;
          transition: background-color 0.6s ease, color 0.6s ease, border-color 0.6s ease, opacity 0.4s ease-in-out;
        }

        .colormorph-theme *::before,
        .colormorph-theme *::after,
        .colormorph-theme div,
        .colormorph-theme p,
        .colormorph-theme span,
        .colormorph-theme li,
        .colormorph-theme td,
        .colormorph-theme th,
        .colormorph-theme strong,
        .colormorph-theme b,
        .colormorph-theme em {
          color: var(--colormorph-fg) !important;
        }

        .colormorph-theme ytd-app,
        .colormorph-theme ytd-app,
        .colormorph-theme ytd-masthead,
        .colormorph-theme ytd-mini-guide-renderer,
        .colormorph-theme ytd-guide-renderer,
        .colormorph-theme ytd-page-manager {
          background-color: var(--colormorph-bg) !important;
          color: var(--colormorph-fg) !important;
          border-color: var(--colormorph-border) !important;
        }

      `;

      const style = document.createElement("style");
      style.id = "colormorph-style";
      style.innerText = css;
      document.head.appendChild(style);
      applyToAllShadowRoots(style);
    });
  }

  const debounced = (() => {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        applyColorMorphTheme();
      }, 200);
    };
  })();

  const observer = new MutationObserver(debounced);

  if (document.readyState === "complete" || document.readyState === "interactive") {
    applyColorMorphTheme();
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
  } else {
    window.addEventListener("DOMContentLoaded", () => {
      applyColorMorphTheme();
      observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    });
  }

  window.applyColorMorphTheme = applyColorMorphTheme;
})();
