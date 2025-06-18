document.getElementById("saveBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url);
  const domain = url.hostname;

  const selectedTheme = document.getElementById("dropdownSelected").dataset.value;
  let background, text, accent, border;

  if (selectedTheme !== "Custom") {
    const theme = themes[selectedTheme];
    background = theme.background;
    text = theme.text;
    accent = theme.accent;
    border = theme.border;
    document.getElementById("bgColor").value = background;
    document.getElementById("textColor").value = text;
  } else {
    background = document.getElementById("bgColor").value;
    text = document.getElementById("textColor").value;
    accent = "#4a90e2";
    border = "#444";
  }

  const enabled = document.getElementById("enableToggle").checked;
  const theme = { background, text, accent, border, enabled };

  chrome.storage.local.set({ [domain]: theme }, () => {
    if (!url.protocol.startsWith("chrome")) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["fixes.js"]
      }, () => {
        if (chrome.runtime.lastError) {
          console.error("fixes.js injection error:", chrome.runtime.lastError.message);
          return;
        }

        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (theme) => {
            document.documentElement.classList.add("colormorph-theme");
            document.documentElement.style.setProperty('--colormorph-bg', theme.background);
            document.documentElement.style.setProperty('--colormorph-fg', theme.text);
            document.documentElement.style.setProperty('--colormorph-accent', theme.accent);
            document.documentElement.style.setProperty('--colormorph-border', theme.border);

            if (typeof window.applyColorMorphTheme === 'function') {
              window.applyColorMorphTheme();
            }
          },
          args: [theme]
        });
      });
    }
  });
});

const themes = {
  "Custom": null,
  "Dark": {
    background: "#1e1e1e",
    text: "#ffffff",
    accent: "#888888",
    border: "#333333"
  },
  "Light": {
    background: "#ffffff",
    text: "#000000",
    accent: "#4a90e2",
    border: "#dddddd"
  },
  "Solarized": {
    background: "#fdf6e3",
    text: "#657b83",
    accent: "#b58900",
    border: "#eee8d5"
  },
  "Neon": {
    background: "#111111",
    text: "#39ff14",
    accent: "#ff00ff",
    border: "#333333"
  },
  "Pastel": {
    background: "#fef6fb",
    text: "#5d4b6b",
    accent: "#d79ac8",
    border: "#e8d5e5"
  },
  "Ocean": {
    background: "#cceeff",
    text: "#003344",
    accent: "#007799",
    border: "#99ccdd"
  },
  "Sunset": {
    background: "#ffcc99",
    text: "#663300",
    accent: "#cc6600",
    border: "#ff9966"
  },
  "Cyberpunk": {
    background: "#1a0033",
    text: "#ff00ff",
    accent: "#00ffff",
    border: "#330066"
  },
  "Neon Night": {
    background: "#1a0026",
    text: "#ffccff",
    accent: "#9900ff",
    border: "#330033"
  },
  "Solarized Earth": {
    background: "#002b36",
    text: "#fdf6e3",
    accent: "#b58900",
    border: "#073642"
  },
  "Minimal Light": {
    background: "#f5f5f5",
    text: "#1a1a1a",
    accent: "#4a90e2",
    border: "#cccccc"
  },
  "Cyber Mint": {
    background: "#001f1f",
    text: "#ccffcc",
    accent: "#00ffaa",
    border: "#004444"
  }
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

    if (saved.enabled) {
      document.getElementById("popup-body").classList.add("colormorph-theme");
    } else {
      document.getElementById("popup-body").classList.remove("colormorph-theme");
    }

    const match = Object.entries(themes).find(([k, v]) =>
      v && v.background === saved.background && v.text === saved.text
    );
    const selected = document.getElementById("dropdownSelected");
    selected.textContent = match ? match[0] : "Custom";
    selected.dataset.value = match ? match[0] : "Custom";
  });

  // Create custom dropdown
  const themeList = Object.keys(themes);
  const dropdown = document.getElementById("customThemeDropdown");
  const selected = document.getElementById("dropdownSelected");
  const options = document.getElementById("dropdownOptions");

  themeList.forEach(theme => {
    const li = document.createElement("li");
    li.textContent = theme;
    li.dataset.value = theme;
    li.addEventListener("click", () => {
      selected.textContent = theme;
      selected.dataset.value = theme;
      options.style.display = "none";
      if (theme !== "Custom") {
        const t = themes[theme];
        document.getElementById("bgColor").value = t.background;
        document.getElementById("textColor").value = t.text;
      }
    });
    options.appendChild(li);
  });

  selected.addEventListener("click", () => {
    options.style.display = options.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      options.style.display = "none";
    }
  });
});
