'use strict';

(function () {
  const FETCH_TIMEOUT_MS = 8000;
  const MATRIX_FRAME_INTERVAL = 80;
  const IPV4_PATTERN = /^\d{1,3}(\.\d{1,3}){3}$/;
  const IPV6_PATTERN = /^[0-9a-fA-F:]+$/;

  // --- Matrix rain background ---

  function initMatrixRain() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = document.getElementById('matrix-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = 340;
    canvas.height = 320;

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    let lastFrame = 0;

    function draw(timestamp) {
      if (timestamp - lastFrame < MATRIX_FRAME_INTERVAL) {
        requestAnimationFrame(draw);
        return;
      }
      lastFrame = timestamp;

      ctx.fillStyle = 'rgba(10, 10, 10, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff41';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  // --- Typewriter reveal effect ---

  function typeReveal(element, text, speed) {
    speed = speed || 40;
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return new Promise(function (resolve) {
      element.classList.remove('loading');
      element.classList.add('revealed');

      if (prefersReducedMotion) {
        element.textContent = text;
        resolve();
        return;
      }

      element.textContent = '';
      var i = 0;
      var interval = setInterval(function () {
        element.textContent += text[i];
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    });
  }

  // --- Fetch with timeout ---

  function fetchWithTimeout(url, timeoutMs) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, timeoutMs);

    return fetch(url, { signal: controller.signal })
      .finally(function () { clearTimeout(timer); });
  }

  // --- IP validation ---

  function isValidIPv4(ip) {
    if (!IPV4_PATTERN.test(ip)) return false;
    return ip.split('.').every(function (octet) {
      var n = parseInt(octet, 10);
      return n >= 0 && n <= 255;
    });
  }

  function isValidIPv6(ip) {
    return IPV6_PATTERN.test(ip) && ip.includes(':');
  }

  // --- State helpers ---

  function showError(element, message) {
    element.classList.remove('loading');
    element.classList.add('error');
    element.textContent = message;
  }

  function showUnavailable(element) {
    element.classList.remove('loading');
    element.classList.add('unavailable');
    element.textContent = 'NOT AVAILABLE';
  }

  // --- Fetch IP addresses ---

  async function fetchIP() {
    var ipEl = document.getElementById('ip-value');
    var ipv6El = document.getElementById('ipv6-value');
    var copyV4Btn = document.getElementById('copy-v4-btn');
    var copyV6Btn = document.getElementById('copy-v6-btn');

    if (!ipEl || !ipv6El) return;

    try {
      var results = await Promise.allSettled([
        fetchWithTimeout('https://api.ipify.org?format=json', FETCH_TIMEOUT_MS),
        fetchWithTimeout('https://api64.ipify.org?format=json', FETCH_TIMEOUT_MS)
      ]);

      var v4Response = results[0];
      var v6Response = results[1];

      // IPv4
      if (v4Response.status === 'fulfilled' && v4Response.value.ok) {
        var v4Data = await v4Response.value.json();
        if (v4Data.ip && isValidIPv4(v4Data.ip)) {
          await typeReveal(ipEl, v4Data.ip);
          if (copyV4Btn) copyV4Btn.disabled = false;
        } else {
          showError(ipEl, 'INVALID RESPONSE');
        }
      } else {
        showError(ipEl, 'CONNECTION FAILED');
      }

      // IPv6 / dual-stack
      if (v6Response.status === 'fulfilled' && v6Response.value.ok) {
        var v6Data = await v6Response.value.json();
        if (v6Data.ip && isValidIPv6(v6Data.ip)) {
          await typeReveal(ipv6El, v6Data.ip, 20);
          if (copyV6Btn) copyV6Btn.disabled = false;
        } else {
          showUnavailable(ipv6El);
        }
      } else {
        showUnavailable(ipv6El);
      }
    } catch (err) {
      showError(ipEl, 'NETWORK ERROR');
      showError(ipv6El, 'NETWORK ERROR');
    }
  }

  // --- Copy to clipboard ---

  function setupCopyButton(btnId, valueId, label) {
    var btn = document.getElementById(btnId);
    if (!btn) return;

    btn.addEventListener('click', async function () {
      if (btn.disabled) return;

      var ipText = document.getElementById(valueId).textContent;
      if (!ipText) return;

      try {
        await navigator.clipboard.writeText(ipText);
      } catch (_) {
        // Fallback for contexts where clipboard API is unavailable
        var ta = document.createElement('textarea');
        ta.value = ipText;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }

      btn.textContent = '✓ COPIED';
      btn.classList.add('copied');
      setTimeout(function () {
        btn.textContent = '\u2398 COPY ' + label;
        btn.classList.remove('copied');
      }, 1500);
    });
  }

  // --- Initialise ---

  setupCopyButton('copy-v4-btn', 'ip-value', 'IPv4');
  setupCopyButton('copy-v6-btn', 'ipv6-value', 'IPv6');
  initMatrixRain();
  fetchIP();
})();
