(function () {
  function adjustColorBrightness(hex, amount) {
    if (!hex || typeof hex !== 'string') return hex;
    hex = hex.startsWith('#') ? hex.slice(1) : hex;

    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }

    const num = parseInt(hex, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;

    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  // הפיכת הפונקציה לגלובלית כך שתהיה זמינה לכל הסקריפטים
  window.adjustColorBrightness = adjustColorBrightness;
})();
