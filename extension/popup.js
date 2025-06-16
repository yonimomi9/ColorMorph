document.getElementById("saveBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url);
  const domain = url.hostname;

  const selectedTheme = document.getElementById("themeSelect").value;
  let background, text;

  if (selectedTheme !== "Custom") {
    background = themes[selectedTheme].background;
    text = themes[selectedTheme].text;
    document.getElementById("bgColor").value = background;
    document.getElementById("textColor").value = text;
  } else {
    background = document.getElementById("bgColor").value;
    text = document.getElementById("textColor").value;
  }

  const enabled = document.getElementById("enableToggle").checked;
  const theme = { background, text, enabled };

  chrome.storage.local.set({ [domain]: theme }, () => {
    if (!url.protocol.startsWith("chrome")) {
      console.log("Injecting fixes.js into tab", tab.id);
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          if (!window.fixesInjected) {
            window.fixesInjected = true;
            const script = document.createElement('script');
            script.src = chrome.runtime.getURL('fixes.js');
            document.documentElement.appendChild(script);
          }
        }
      }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error injecting fixes.js:", chrome.runtime.lastError.message);
          return;
        }

        chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (theme) => {
            document.addEventListener('ColorMorphReady', () => {
            console.log("✅ ColorMorphReady received – applying theme");

            document.documentElement.style.setProperty('--colormorph-bg', theme.background);
            document.documentElement.style.setProperty('--colormorph-fg', theme.text);
            document.body.style.setProperty('--colormorph-bg', theme.background);
            document.body.style.setProperty('--colormorph-fg', theme.text);

            if (typeof window.applyColorMorphTheme === 'function') {
                window.applyColorMorphTheme(theme);
                console.log("✅ applyColorMorphTheme called successfully.");
            } else {
                console.warn("❌ applyColorMorphTheme not defined.");
            }
            });
        },
        args: [theme]
        });

      });
    }
  });
});

function applyTheme(theme) {
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

  const bg = theme.background;
  const fg = theme.text;
  const mid = adjustColorBrightness(bg, -10);

  document.documentElement.style.setProperty('--colormorph-bg', bg);
  document.documentElement.style.setProperty('--colormorph-fg', fg);
  document.body.style.setProperty('--colormorph-bg', bg);
  document.body.style.setProperty('--colormorph-fg', fg);

  const css = `
    html, body, main, section, article, header, footer, nav, aside {
      background-color: var(--colormorph-bg) !important;
      color: var(--colormorph-fg) !important;
    }

    * {
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
  const existing = document.getElementById('colormorph-style');
  if (existing) existing.remove();
  const styleTag = document.createElement('style');
  styleTag.id = 'colormorph-style';
  styleTag.innerText = css;
  document.head.appendChild(styleTag);

  const innerBg = adjustColorBrightness(bg, -15);
  document.querySelectorAll("button, input, textarea, select").forEach(el => {
    el.style.backgroundColor = innerBg;
    el.style.color = fg;
    el.style.borderColor = fg;
  });

  function recursiveColor(node) {
    if (!(node instanceof HTMLElement)) return;
    const textExists = node.innerText?.trim()?.length > 0;
    const isContainer = node.children.length > 0;
    if ((textExists || !isContainer) && node.offsetWidth > 0 && node.offsetHeight > 0) {
      node.style.backgroundColor = bg;
      node.style.color = fg;
      node.style.borderColor = fg;
    }
    [...node.children].forEach(child => recursiveColor(child));
  }

  recursiveColor(document.body);

  if (location.hostname.includes("linkedin.com")) {
    const lighterBg = adjustColorBrightness(bg, 10);
    const darkerBg = adjustColorBrightness(bg, -20);

    document.querySelectorAll('.scaffold-layout, .artdeco-card, .feed-shared-update-v2').forEach(el => {
      el.style.backgroundColor = lighterBg;
      el.style.border = `1px solid ${adjustColorBrightness(bg, -30)}`;
      el.style.color = fg;
    });

    document.querySelectorAll('button, .artdeco-button').forEach(el => {
      el.style.backgroundColor = darkerBg;
      el.style.color = fg;
      el.style.borderColor = fg;
    });
  }

  document.querySelectorAll('*').forEach(el => {
    const computedBg = getComputedStyle(el).backgroundColor;
    if (computedBg === 'rgb(255, 255, 255)' || computedBg === '#ffffff') {
      el.style.backgroundColor = mid;
      el.style.color = fg;
    }
  });
}

function removeInjectedStyle() {
  const existing = document.getElementById('colormorph-style');
  if (existing) existing.remove();
  document.documentElement.style.removeProperty('--colormorph-bg');
  document.documentElement.style.removeProperty('--colormorph-fg');
  document.body.style.removeProperty('--colormorph-bg');
  document.body.style.removeProperty('--colormorph-fg');

  const elements = document.querySelectorAll('*');
  elements.forEach(el => {
    el.style.removeProperty('background-color');
    el.style.removeProperty('color');
    el.style.removeProperty('border-color');
    el.style.removeProperty('caret-color');
    el.style.removeProperty('filter');
  });
}

const themes = {
  "Custom": null,
  "Dark": { background: "#1e1e1e", text: "#ffffff" },
  "Light": { background: "#ffffff", text: "#000000" },
  "Solarized": { background: "#fdf6e3", text: "#657b83" },
  "Neon": { background: "#111111", text: "#39ff14" },
  "Pastel": { background: "#fef6fb", text: "#5d4b6b" },
  "Matrix": { background: "#0f0f0f", text: "#00ff00" },
  "Ocean": { background: "#cceeff", text: "#003344" },
  "Sunset": { background: "#ffcc99", text: "#663300" },
  "Cyberpunk": { background: "#1a0033", text: "#ff00ff" }
};


document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const domain = new URL(tab.url).hostname;

  chrome.storage.local.get([domain], (result) => {
    const saved = result[domain];
    if (!saved) return;

    document.getElementById("bgColor").value = saved.background;
    document.getElementById("textColor").value = saved.text;
    document.getElementById("enableToggle").checked = saved.enabled;

    const found = Object.entries(themes).find(([name, value]) =>
      value && value.background === saved.background && value.text === saved.text
    );
    document.getElementById("themeSelect").value = found ? found[0] : "Custom";
  });

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    const domain = new URL(tab.url).hostname;
    chrome.storage.local.get([domain], (result) => {
      const saved = result[domain];
      if (saved?.enabled) {
      chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (theme) => window.applyColorMorphTheme?.(theme),
      args: [saved]
    });
    } else {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.resetThemeStyles?.()
    });
    }

    });

    window.addEventListener("message", async (event) => {
        if (event.source !== window) return;
        if (event.data?.type === "COLORMORPH_THEME_REQUEST") {
            const hostname = event.data.hostname;

            chrome.storage.local.get([hostname], (result) => {
            const theme = result[hostname];
            window.postMessage({
                type: "COLORMORPH_THEME_RESPONSE",
                theme
            }, "*");
            });
        }
        });

  });
});
