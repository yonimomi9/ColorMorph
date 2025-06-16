// fixes.js – Stable version for ColorMorph across ChatGPT, Google, LinkedIn
(function () {
  // console.log("✅ fixes.js loaded and executing");

  function adjustColorBrightness(hex, amount) {
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

  function applyTheme(root = document) {
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--colormorph-bg').trim();
    const fg = getComputedStyle(document.documentElement).getPropertyValue('--colormorph-fg').trim();
    if (!bg || !fg) return;

    const soft = adjustColorBrightness(bg, 10);
    const mid = adjustColorBrightness(bg, -10);
    const dark = adjustColorBrightness(bg, -25);

    root.querySelectorAll('*').forEach(el => {
      const style = getComputedStyle(el);
      const bg = style.backgroundColor;
      const isWhiteish = bg === 'rgb(255, 255, 255)' || bg === '#ffffff' || bg.includes('rgba(255,255,255');
      if (
        el.offsetWidth > 20 &&
        el.offsetHeight > 20 &&
        isWhiteish &&
        style.backgroundImage === 'none' &&
        !['IMG', 'SVG', 'VIDEO'].includes(el.tagName)
      ) {
        el.style.backgroundColor = mid;
        el.style.color = fg;
        el.style.borderColor = fg;
        el.style.caretColor = fg;
        el.style.borderRadius = '8px';
        el.style.boxShadow = 'none';
      }
    });

    root.querySelectorAll('button, input, textarea, select, .btn, [role="button"]').forEach(el => {
      el.style.backgroundColor = dark;
      el.style.color = fg;
      el.style.borderColor = fg;
      el.style.borderRadius = '6px';
    });

    root.querySelectorAll('a').forEach(a => {
      a.style.color = fg;
    });

    root.querySelectorAll('code, pre, blockquote').forEach(el => {
      el.style.backgroundColor = soft;
      el.style.color = fg;
    });

    root.querySelectorAll('*').forEach(el => {
      if (el.shadowRoot) {
        try {
          applyTheme(el.shadowRoot);
        } catch (_) {}
      }
    });
  }

  function resetThemeStyles(root = document) {
    root.querySelectorAll('*').forEach(el => {
      el.style.backgroundColor = '';
      el.style.color = '';
      el.style.borderColor = '';
      el.style.borderRadius = '';
      el.style.boxShadow = '';
      el.style.caretColor = '';
    });

    root.querySelectorAll('button, input, textarea, select, .btn, [role="button"]').forEach(el => {
      el.style.backgroundColor = '';
      el.style.color = '';
      el.style.borderColor = '';
      el.style.borderRadius = '';
    });

    root.querySelectorAll('code, pre, blockquote').forEach(el => {
      el.style.backgroundColor = '';
      el.style.color = '';
    });

    root.querySelectorAll('a').forEach(a => {
      a.style.color = '';
    });

    root.querySelectorAll('*').forEach(el => {
      if (el.shadowRoot) {
        try {
          resetThemeStyles(el.shadowRoot);
        } catch (_) {}
      }
    });
  }


  function fixChatGptSpecific() {
    if (!location.hostname.includes('chat.openai.com')) return;

    const fg = getComputedStyle(document.documentElement).getPropertyValue('--colormorph-fg').trim();
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--colormorph-bg').trim();
    const soft = adjustColorBrightness(bg, 10);
    const dark = adjustColorBrightness(bg, -20);

    const content = document.querySelector('main');
    if (content) {
      content.style.backgroundColor = 'transparent';
      content.style.color = fg;
    }

    const sidebar = document.querySelector('nav');
    if (sidebar) {
      sidebar.style.backgroundColor = soft;
      sidebar.style.color = fg;
    }

    const inputArea = document.querySelector('textarea');
    if (inputArea) {
      inputArea.style.backgroundColor = dark;
      inputArea.style.color = fg;
      inputArea.style.borderColor = fg;
      inputArea.style.borderRadius = '6px';
    }

    const markdowns = document.querySelectorAll('[class*="markdown"]');
    markdowns.forEach(el => {
      el.style.color = fg;
    });

    // הסרת מלבן רקע מיותר ב־ChatGPT
    document.querySelectorAll('main > div').forEach(el => {
      const style = getComputedStyle(el);
      const isLikelyEmpty = el.children.length === 0 || el.textContent.trim().length < 5;
      const isHuge = el.offsetHeight > 300 && el.offsetWidth > 300;

      if (isLikelyEmpty && isHuge) {
        el.style.backgroundColor = 'transparent';
        el.style.border = 'none';
        el.style.boxShadow = 'none';
      }
    });
  }

  function fixGoogleSpecific() {
    if (!location.hostname.includes('google.')) return;
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--colormorph-bg').trim();
    const fg = getComputedStyle(document.documentElement).getPropertyValue('--colormorph-fg').trim();

    const soft = adjustColorBrightness(bg, 10);
    const result = adjustColorBrightness(bg, 5);
    const dark = adjustColorBrightness(bg, -20);

    document.querySelectorAll('body, html').forEach(el => {
      el.style.backgroundColor = bg;
      el.style.color = fg;
    });

    document.querySelectorAll('input[type="text"], input[type="search"]').forEach(input => {
      input.style.backgroundColor = soft;
      input.style.color = fg;
      input.style.borderColor = fg;
    });

    document.querySelectorAll('.rc, .tF2Cxc, .g').forEach(block => {
      block.style.backgroundColor = result;
      block.style.color = fg;
      block.style.borderRadius = '10px';
      block.style.padding = '12px';
    });

    document.querySelectorAll('input[type="submit"], .gNO89b, .RNmpXc').forEach(btn => {
      btn.style.backgroundColor = dark;
      btn.style.color = fg;
      btn.style.borderColor = fg;
    });

    document.querySelectorAll('#fbar, footer').forEach(el => {
      el.style.backgroundColor = soft;
      el.style.color = fg;
    });
  }

  function fixLinkedinSpecific() {
    if (!location.hostname.includes('linkedin.com')) return;
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--colormorph-bg').trim();
    const fg = getComputedStyle(document.documentElement).getPropertyValue('--colormorph-fg').trim();
    const soft = adjustColorBrightness(bg, 15);
    const card = adjustColorBrightness(bg, 5);
    const dark = adjustColorBrightness(bg, -20);
    const border = adjustColorBrightness(bg, -40);

    document.querySelectorAll(`
      .artdeco-card,
      .feed-shared-update-v2,
      .update-components-actor,
      .feed-shared-text,
      .pvs-profile-actions
    `).forEach(el => {
      el.style.backgroundColor = card;
      el.style.color = fg;
      el.style.borderRadius = '10px';
      el.style.borderColor = border;
      el.style.borderWidth = '1px';
      el.style.borderStyle = 'solid';
    });

    document.querySelectorAll(`
      button, .artdeco-button,
      .feed-shared-social-action-bar,
      .comments-comment-box__form,
      .comments-comment-box__submit-button
    `).forEach(el => {
      el.style.backgroundColor = dark;
      el.style.color = fg;
      el.style.borderColor = border;
      el.style.borderRadius = '6px';
    });

    document.querySelectorAll(`
      .update-components-text,
      .feed-shared-inline-show-more-text,
      .comments-comment-item
    `).forEach(el => {
      el.style.backgroundColor = soft;
      el.style.color = fg;
    });

    document.querySelectorAll('*').forEach(el => {
      const style = getComputedStyle(el);
      const bgColor = style.backgroundColor;
      const opacity = parseFloat(style.opacity || '1');
      const visibility = style.visibility;

      const isWhite =
        bgColor === 'rgb(255, 255, 255)' ||
        bgColor === '#ffffff' ||
        bgColor.replace(/\s+/g, '') === 'rgba(255,255,255,1)';

      const isVisible = opacity > 0.4 && visibility !== 'hidden';
      const hasMedia = el.querySelector('img, video, iframe, svg');

      const rect = el.getBoundingClientRect();
      const isLargeEnough = rect.width > 60 && rect.height > 40;

      if (isWhite && isVisible && !hasMedia && isLargeEnough) {
        el.style.backgroundColor = card;
        el.style.color = fg;
      }
    });
  }
  window.applyColorMorphTheme = () => {
    try {
      // נסה למשוך ישירות אם אפשר
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get([window.location.hostname], (result) => {
          const theme = result[window.location.hostname];
          applyOrReset(theme);
        });
      } else {
        // אחרת – בקש תמה מה־popup/background
        window.addEventListener("message", function handleThemeResponse(event) {
          if (event.data?.type === "COLORMORPH_THEME_RESPONSE") {
            window.removeEventListener("message", handleThemeResponse);
            applyOrReset(event.data.theme);
          }
        });

        window.postMessage({ type: "COLORMORPH_THEME_REQUEST", hostname: window.location.hostname }, "*");
      }
    } catch (err) {
      console.warn("❗ applyColorMorphTheme error:", err);
    }
  };

  function applyOrReset(theme) {
    if (!theme || !theme.enabled) {
      // console.log("🛑 Theme disabled — resetting styles completely");

      document.documentElement.style.removeProperty('--colormorph-bg');
      document.documentElement.style.removeProperty('--colormorph-fg');
      document.body.style.removeProperty('--colormorph-bg');
      document.body.style.removeProperty('--colormorph-fg');

      const existingStyle = document.getElementById('colormorph-style');
      if (existingStyle) existingStyle.remove();

      resetThemeStyles();
      return;
    }

    // console.log("🎨 Applying theme...");
    document.documentElement.style.setProperty('--colormorph-bg', theme.background);
    document.documentElement.style.setProperty('--colormorph-fg', theme.text);
    document.body.style.setProperty('--colormorph-bg', theme.background);
    document.body.style.setProperty('--colormorph-fg', theme.text);

    resetThemeStyles();
    applyTheme();
    fixGoogleSpecific();
    fixLinkedinSpecific();
    fixChatGptSpecific();
  }

  const observeWhenReady = () => {
    if (!document.body) return setTimeout(observeWhenReady, 100);

    let debounceTimer = null;
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        // console.log("🌀 Debounced mutation – reapplying theme");
        window.applyColorMorphTheme?.();
      }, 150); // אפשר גם 100ms אם אתה רוצה מהיר יותר
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === "complete" || document.readyState === "interactive") {
    window.applyColorMorphTheme?.();
    observeWhenReady();
  } else {
    window.addEventListener("DOMContentLoaded", () => {
      window.applyColorMorphTheme?.();
      observeWhenReady();
    });
  }

  window.adjustColorBrightness = adjustColorBrightness;
  window.resetThemeStyles = resetThemeStyles;
  window.applyTheme = applyTheme;
  window.fixGoogleSpecific = fixGoogleSpecific;
  window.fixLinkedinSpecific = fixLinkedinSpecific;
  window.fixChatGptSpecific = fixChatGptSpecific;

  document.dispatchEvent(new CustomEvent('ColorMorphReady'));
  window.fixChatGptSpecific = fixChatGptSpecific;

})();
