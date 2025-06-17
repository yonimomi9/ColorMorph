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

    const match = Object.entries(themes).find(([k, v]) =>
      v && v.background === saved.background && v.text === saved.text
    );
    document.getElementById("themeSelect").value = match ? match[0] : "Custom";
  });
});
