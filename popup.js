// Matrix rain background
function initMatrixRain() {
  const canvas = document.getElementById('matrix-bg');
  const ctx = canvas.getContext('2d');

  canvas.width = 340;
  canvas.height = 320;

  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
  const fontSize = 12;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = new Array(columns).fill(1);

  function draw() {
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
  }

  setInterval(draw, 80);
}

// Typewriter reveal effect
function typeReveal(element, text, speed = 40) {
  return new Promise((resolve) => {
    element.classList.remove('loading');
    element.classList.add('revealed');
    element.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
      element.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}

// Fetch IP addresses
async function fetchIP() {
  const ipEl = document.getElementById('ip-value');
  const ipv6El = document.getElementById('ipv6-value');

  try {
    const [v4Response, v6Response] = await Promise.allSettled([
      fetch('https://api.ipify.org?format=json'),
      fetch('https://api64.ipify.org?format=json')
    ]);

    // IPv4
    if (v4Response.status === 'fulfilled' && v4Response.value.ok) {
      const v4Data = await v4Response.value.json();
      await typeReveal(ipEl, v4Data.ip);
    } else {
      ipEl.classList.remove('loading');
      ipEl.classList.add('error');
      ipEl.textContent = 'CONNECTION FAILED';
    }

    // IPv6 / dual-stack
    if (v6Response.status === 'fulfilled' && v6Response.value.ok) {
      const v6Data = await v6Response.value.json();
      const ip = v6Data.ip;
      // api64 returns IPv4 if no IPv6 available
      if (ip.includes(':')) {
        await typeReveal(ipv6El, ip, 20);
      } else {
        ipv6El.classList.remove('loading');
        ipv6El.style.opacity = '0.4';
        ipv6El.style.fontSize = '12px';
        ipv6El.textContent = 'NOT AVAILABLE';
      }
    } else {
      ipv6El.classList.remove('loading');
      ipv6El.style.opacity = '0.4';
      ipv6El.style.fontSize = '12px';
      ipv6El.textContent = 'NOT AVAILABLE';
    }
  } catch (err) {
    ipEl.classList.remove('loading');
    ipEl.classList.add('error');
    ipEl.textContent = 'NETWORK ERROR';
    ipv6El.classList.remove('loading');
    ipv6El.classList.add('error');
    ipv6El.textContent = 'NETWORK ERROR';
  }
}

// Copy to clipboard helper
function setupCopyButton(btnId, valueId, label) {
  document.getElementById(btnId).addEventListener('click', async () => {
    const ipText = document.getElementById(valueId).textContent;
    const invalid = ['LOCATING...', 'CONNECTION FAILED', 'NETWORK ERROR', 'NOT AVAILABLE'];
    if (!ipText || invalid.includes(ipText)) return;

    try {
      await navigator.clipboard.writeText(ipText);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = ipText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    const btn = document.getElementById(btnId);
    btn.textContent = '✓ COPIED';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = `⎘ COPY ${label}`;
      btn.classList.remove('copied');
    }, 1500);
  });
}

setupCopyButton('copy-v4-btn', 'ip-value', 'IPv4');
setupCopyButton('copy-v6-btn', 'ipv6-value', 'IPv6');

// Initialize
initMatrixRain();
fetchIP();
