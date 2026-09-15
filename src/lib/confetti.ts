// ─────────────────────────────────────────────
// Antigravity — Pure Canvas Confetti Burst
// Ultra-lightweight, zero external dependencies
// ─────────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
}

export function triggerConfetti(durationMs: number = 2500): void {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const colors = [
    '#8b5cf6', // electric violet
    '#a855f7', // purple
    '#f43f5e', // queen crimson
    '#fbbf24', // championship gold
    '#10b981', // emerald
    '#38bdf8', // cyan
    '#f472b6', // hot pink
  ];

  const particleCount = Math.min(120, Math.floor(width / 8));
  const particles: Particle[] = [];

  // Spawn from center-left and center-right cannons
  for (let i = 0; i < particleCount; i++) {
    const isLeft = i % 2 === 0;
    const originX = isLeft ? width * 0.2 : width * 0.8;
    const originY = height * 0.45;
    const angle = isLeft
      ? (Math.PI / 4) + (Math.random() * Math.PI / 3) - Math.PI / 6
      : (3 * Math.PI / 4) - (Math.random() * Math.PI / 3) + Math.PI / 6;
    const speed = 7 + Math.random() * 12;

    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed * (isLeft ? 1 : -1),
      vy: -Math.sin(angle) * speed - (Math.random() * 5),
      size: 6 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      alpha: 1,
    });
  }

  let startTime = performance.now();

  function animate(now: number) {
    const elapsed = now - startTime;
    if (elapsed > durationMs) {
      canvas.remove();
      return;
    }

    ctx!.clearRect(0, 0, width, height);

    const progress = elapsed / durationMs;
    const fadeStart = 0.65;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.98; // drag
      p.rotation += p.rotationSpeed;

      if (progress > fadeStart) {
        p.alpha = Math.max(0, 1 - (progress - fadeStart) / (1 - fadeStart));
      }

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate((p.rotation * Math.PI) / 180);
      ctx!.globalAlpha = p.alpha;
      ctx!.fillStyle = p.color;

      // Draw rectangular confetti piece
      ctx!.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.7);
      ctx!.restore();
    });

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
