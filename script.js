const root = document.documentElement;
const toggle = document.querySelector(".theme-toggle");
const savedTheme = localStorage.getItem("portfolio-theme");
const sketchRoot = document.querySelector("#sketch-root");

if (savedTheme === "dark") {
  root.classList.add("dark");
}

toggle?.addEventListener("click", () => {
  root.classList.toggle("dark");
  localStorage.setItem("portfolio-theme", root.classList.contains("dark") ? "dark" : "light");
});

const sketchNames = ["flowLines", "orbitStudy", "signalGrid"];
const selectedSketch = sketchNames[Math.floor(Math.random() * sketchNames.length)];

function startP5Sketch(name) {
  if (!sketchRoot || !window.p5) return false;

  new window.p5((p) => {
    let points = [];
    let particles = [];

    const fit = () => {
      const rect = sketchRoot.getBoundingClientRect();
      p.resizeCanvas(Math.max(320, rect.width), Math.max(320, rect.height));
    };

    p.setup = () => {
      const rect = sketchRoot.getBoundingClientRect();
      p.createCanvas(Math.max(320, rect.width), Math.max(320, rect.height)).parent(sketchRoot);
      p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
      p.noiseSeed(Math.floor(Math.random() * 10000));
      p.background(17, 22, 21);

      points = Array.from({ length: 88 }, () => ({
        x: p.random(p.width),
        y: p.random(p.height),
        speed: p.random(0.45, 1.4),
      }));

      particles = Array.from({ length: 28 }, (_, index) => ({
        angle: (p.TWO_PI / 28) * index,
        radius: p.random(70, Math.min(p.width, p.height) * 0.38),
        offset: p.random(1000),
      }));
    };

    p.windowResized = fit;

    p.draw = () => {
      if (name === "flowLines") drawFlowLines(p, points);
      if (name === "orbitStudy") drawOrbitStudy(p, particles);
      if (name === "signalGrid") drawSignalGrid(p);
    };
  });

  return true;
}

function drawFlowLines(p, points) {
  p.background(17, 22, 21, 22);
  p.strokeWeight(1.4);

  points.forEach((point, index) => {
    const scale = 0.0024;
    const angle = p.noise(point.x * scale, point.y * scale, p.frameCount * 0.004) * p.TWO_PI * 2;
    const hue = index % 3;
    if (hue === 0) p.stroke(85, 199, 184, 150);
    if (hue === 1) p.stroke(239, 141, 120, 120);
    if (hue === 2) p.stroke(245, 201, 91, 120);
    p.line(point.x, point.y, point.x + Math.cos(angle) * 26, point.y + Math.sin(angle) * 26);
    point.x = (point.x + Math.cos(angle) * point.speed + p.width) % p.width;
    point.y = (point.y + Math.sin(angle) * point.speed + p.height) % p.height;
  });
}

function drawOrbitStudy(p, particles) {
  p.background(17, 22, 21, 30);
  const cx = p.width * 0.5;
  const cy = p.height * 0.52;

  p.noFill();
  p.stroke(85, 199, 184, 80);
  p.strokeWeight(1);
  for (let r = 80; r < Math.min(p.width, p.height) * 0.5; r += 42) {
    p.circle(cx, cy, r * 2);
  }

  particles.forEach((particle, index) => {
    const pulse = p.sin(p.frameCount * 0.02 + particle.offset) * 18;
    const x = cx + p.cos(particle.angle + p.frameCount * 0.006) * (particle.radius + pulse);
    const y = cy + p.sin(particle.angle * 1.4 + p.frameCount * 0.008) * (particle.radius * 0.56 + pulse);
    p.noStroke();
    p.fill(index % 2 ? p.color(239, 141, 120, 190) : p.color(139, 183, 239, 190));
    p.circle(x, y, index % 4 === 0 ? 14 : 7);
  });
}

function drawSignalGrid(p) {
  p.background(17, 22, 21);
  const cell = Math.max(28, Math.min(58, p.width / 13));

  for (let y = cell; y < p.height; y += cell) {
    for (let x = cell; x < p.width; x += cell) {
      const wave = p.sin(x * 0.018 + y * 0.012 + p.frameCount * 0.04);
      const size = p.map(wave, -1, 1, 4, cell * 0.68);
      p.noFill();
      p.strokeWeight(1.2);
      p.stroke(wave > 0.45 ? 245 : 85, wave > 0.45 ? 201 : 199, wave > 0.45 ? 91 : 184, 150);
      p.rect(x - size / 2, y - size / 2, size, size, 6);
    }
  }
}

function startCanvasFallback(name) {
  if (!sketchRoot) return;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  sketchRoot.append(canvas);

  const fit = () => {
    const rect = sketchRoot.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(320, rect.width) * ratio;
    canvas.height = Math.max(320, rect.height) * ratio;
    canvas.style.height = `${Math.max(320, rect.height)}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const points = Array.from({ length: 90 }, () => ({
    x: Math.random() * 900,
    y: Math.random() * 600,
    speed: 0.5 + Math.random(),
  }));

  let frame = 0;
  fit();
  window.addEventListener("resize", fit);

  const draw = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    context.fillStyle = name === "signalGrid" ? "#111615" : "rgba(17, 22, 21, 0.14)";
    context.fillRect(0, 0, width, height);

    if (name === "signalGrid") {
      const cell = Math.max(28, Math.min(58, width / 13));
      for (let y = cell; y < height; y += cell) {
        for (let x = cell; x < width; x += cell) {
          const wave = Math.sin(x * 0.018 + y * 0.012 + frame * 0.04);
          const size = ((wave + 1) / 2) * (cell * 0.62) + 4;
          context.strokeStyle = wave > 0.45 ? "rgba(245, 201, 91, 0.72)" : "rgba(85, 199, 184, 0.62)";
          context.strokeRect(x - size / 2, y - size / 2, size, size);
        }
      }
    } else {
      points.forEach((point, index) => {
        const angle = Math.sin(point.x * 0.008 + frame * 0.014) + Math.cos(point.y * 0.009);
        context.strokeStyle = index % 3 === 0 ? "rgba(85, 199, 184, 0.72)" : "rgba(239, 141, 120, 0.58)";
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(point.x + Math.cos(angle) * 24, point.y + Math.sin(angle) * 24);
        context.stroke();
        point.x = (point.x + Math.cos(angle) * point.speed + width) % width;
        point.y = (point.y + Math.sin(angle) * point.speed + height) % height;
      });
    }

    frame += 1;
    requestAnimationFrame(draw);
  };

  draw();
}

window.addEventListener("load", () => {
  const didStartP5 = startP5Sketch(selectedSketch);
  if (!didStartP5) startCanvasFallback(selectedSketch);
});
