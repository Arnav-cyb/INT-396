/**
 * Native Canvas 2D Confetti Explosion Engine
 * Zero external package dependencies. Runs with high-performance requestAnimationFrame.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  alpha: number;
  decay: number;
}

const PALETTE = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#ec4899", "#06b6d4", "#f59e0b"];

export function launchConfetti(xPercent = 0.5, yPercent = 0.4) {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = (canvas.width = window.innerWidth);
  const h = (canvas.height = window.innerHeight);

  const originX = w * xPercent;
  const originY = h * yPercent;

  const particles: Particle[] = [];
  const particleCount = 75;

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 12 + 4;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: Math.random() * 7 + 4,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 12,
      alpha: 1,
      decay: Math.random() * 0.015 + 0.01,
    });
  }

  let animationFrameId: number;

  function render() {
    ctx?.clearRect(0, 0, w, h);

    let activeCount = 0;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity
      p.vx *= 0.98; // drag
      p.rotation += p.vRot;
      p.alpha -= p.decay;

      if (p.alpha > 0) {
        activeCount++;
        ctx!.save();
        ctx!.globalAlpha = Math.max(0, p.alpha);
        ctx!.translate(p.x, p.y);
        ctx!.rotate((p.rotation * Math.PI) / 180);
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        ctx!.restore();
      }
    }

    if (activeCount > 0) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrameId);
      document.body.removeChild(canvas);
    }
  }

  render();
}
