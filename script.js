// 3D particle background (Three.js)
const canvas = document.querySelector("#scene");
let scene, camera, renderer, particles, animationId;

function initThree() {
  if (!window.THREE || !canvas) return;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 8;

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const count = window.innerWidth < 700 ? 650 : 1200;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    const tint = Math.random();
    colors[i * 3] = 0.28 + tint * 0.35;
    colors[i * 3 + 1] = 0.65 + tint * 0.25;
    colors[i * 3 + 2] = 0.9 + tint * 0.1;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 0.025, vertexColors: true, transparent: true,
    opacity: 0.72, sizeAttenuation: true
  });
  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  const animate = () => {
    animationId = requestAnimationFrame(animate);
    particles.rotation.y += 0.00045;
    particles.rotation.x += 0.00016;
    renderer.render(scene, camera);
  };
  animate();
}

function resizeThree() {
  if (!renderer || !camera) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
initThree();
window.addEventListener("resize", resizeThree);

// Mobile navigation
const menuToggle = document.querySelector("#menuToggle");
const nav = document.querySelector("#nav");
menuToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
nav?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

// Reveal sections as they enter the viewport
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
const startReveal = () => document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

// Subtle 3D tilt for project cards (desktop pointer devices)
if (window.matchMedia("(pointer:fine)").matches) {
  document.querySelectorAll("[data-tilt]").forEach(card => {
    card.addEventListener("mousemove", event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => card.style.transform = "");
  });
}

// Footer year
document.querySelector("#year").textContent = new Date().getFullYear();

// Contact form -> opens the visitor's email app with the message filled in
const contactForm = document.querySelector("#contactForm");
contactForm?.addEventListener("submit", event => {
  event.preventDefault();
  const status = document.querySelector("#formStatus");
  const fields = [document.querySelector("#cName"), document.querySelector("#cEmail"), document.querySelector("#cMsg")];
  let valid = true;
  fields.forEach(f => {
    const ok = f.value.trim() && (f.type !== "email" || /^\S+@\S+\.\S+$/.test(f.value.trim()));
    f.classList.toggle("invalid", !ok);
    if (!ok) valid = false;
  });
  if (!valid) { status.textContent = "Please fill in all fields correctly."; return; }
  const [name, email, msg] = fields.map(f => f.value.trim());
  const subject = encodeURIComponent("Portfolio message from " + name);
  const body = encodeURIComponent(msg + "\n\n— " + name + " (" + email + ")");
  window.location.href = "mailto:luqmanhakeem266@gmail.com?subject=" + subject + "&body=" + body;
  status.textContent = "Opening your email app…";
  contactForm.reset();
});

// Intro loader: greetings in many languages + progress, then the page opens
(function () {
  const loader = document.querySelector("#loader");
  if (!loader) { startReveal(); return; }
  const greetings = [
    ["Hello","English","en"],["السلام علیکم","اردو · Urdu","ur"],["Hola","Español","es"],["नमस्ते","हिन्दी · Hindi","hi"],
    ["Bonjour","Français","fr"],["مرحبا","العربية · Arabic","ar"],["你好","中文 · Chinese","zh"],["Ciao","Italiano","it"],
    ["こんにちは","日本語 · Japanese","ja"],["Hallo","Deutsch","de"],["안녕하세요","한국어 · Korean","ko"],["Merhaba","Türkçe","tr"],
    ["Привет","Русский","ru"],["Olá","Português","pt"],["Welcome","Luqman's Portfolio","en"]
  ];
  const word = document.querySelector("#loaderWord"), lang = document.querySelector("#loaderLang");
  const bar = document.querySelector("#loaderBar"), pct = document.querySelector("#loaderPct");
  const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  const duration = reduce ? 600 : 3000;
  const t0 = performance.now();
  let pageReady = document.readyState === "complete", finished = false, lastIdx = -1;
  window.addEventListener("load", () => { pageReady = true; });

  const finish = () => {
    if (finished) return; finished = true;
    loader.classList.add("done");
    setTimeout(() => {
      loader.remove();
      document.body.classList.remove("loading");
      startReveal();
    }, 1400);
  };
  const tick = now => {
    const p = Math.min((now - t0) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 2.2);
    const shown = pageReady ? eased : Math.min(eased, 0.92);
    bar.style.width = (shown * 100) + "%";
    pct.textContent = Math.round(shown * 100) + "%";
    const idx = Math.min(Math.floor(p * greetings.length), greetings.length - 1);
    if (idx !== lastIdx) {
      lastIdx = idx;
      const [w, l, code] = greetings[idx];
      word.textContent = w; word.lang = code; lang.textContent = l;
      word.style.animation = "none"; void word.offsetWidth; word.style.animation = "";
    }
    if (p >= 1 && pageReady) { bar.style.width = "100%"; pct.textContent = "100%"; setTimeout(finish, 350); return; }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();
