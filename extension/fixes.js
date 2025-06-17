(function () {
  function applyColorMorphTheme() {
    chrome.storage.local.get([location.hostname], (result) => {
      const theme = result[location.hostname];
      if (!theme || !theme.enabled) {
        document.documentElement.classList.remove("colormorph-theme");
        document.documentElement.style.removeProperty('--colormorph-bg');
        document.documentElement.style.removeProperty('--colormorph-fg');
        const existing = document.getElementById("colormorph-style");
        if (existing) existing.remove();
        return;
      }

      document.documentElement.classList.add("colormorph-theme");
      document.documentElement.style.setProperty('--colormorph-bg', theme.background);
      document.documentElement.style.setProperty('--colormorph-fg', theme.text);

      const css = `
        .colormorph-theme {
          --colormorph-bg: ${theme.background};
          --colormorph-fg: ${theme.text};
        }

        .colormorph-theme body,
        .colormorph-theme html {
          background-color: var(--colormorph-bg) !important;
          color: var(--colormorph-fg) !important;
        }

        .colormorph-theme button,
        .colormorph-theme input,
        .colormorph-theme textarea,
        .colormorph-theme select {
          background-color: transparent !important;
          color: var(--colormorph-fg) !important;
          border-color: var(--colormorph-fg) !important;
        }

        .colormorph-theme a {
          color: var(--colormorph-fg) !important;
        }
      `;
      const style = document.createElement("style");
      style.id = "colormorph-style";
      style.innerText = css;
      document.head.appendChild(style);
    });
  }

  const observer = new MutationObserver(() => {
    if (typeof applyColorMorphTheme === 'function') {
      applyColorMorphTheme();
    }
  });

  if (document.readyState === "complete" || document.readyState === "interactive") {
    applyColorMorphTheme();
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    window.addEventListener("DOMContentLoaded", () => {
      applyColorMorphTheme();
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  window.applyColorMorphTheme = applyColorMorphTheme;
})();
