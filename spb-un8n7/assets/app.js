/* ------------------------------------------------------------------
   Slow-Paced Breathing tutorial · behaviour
   ------------------------------------------------------------------ */

/* ===== 1. VIDEO LINKS =============================================
   Paste the YouTube video ID (the part after "v=" or "youtu.be/")
   for each video. Leave as "" to show a placeholder.
   Example: "dQw4w9WgXcQ"
   ================================================================== */
const VIDEOS = {
  section1: "-FjFh2OPBsg",   // SPB_Section_1.mp4 · introduction to slow-paced breathing
  section2: "2ULVtoN95Ng",   // SPB_Section_2.mp4 · setting up the app
  section3: "-hR0gKMevlw"    // SPB_Section_3.mp4 · guided 3-minute practice
};

/* ===== helpers ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ===== videos ===== */
Object.entries(VIDEOS).forEach(([key, id]) => {
  const frame = $('#video-' + key);
  if (!frame) return;
  if (id) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
    iframe.title = 'Tutorial video';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    frame.appendChild(iframe);
  } else {
    frame.innerHTML = `<div class="video-placeholder"><div><div class="vp-icon"></div>Video coming soon</div></div>`;
  }
});

/* ===== breathing animation (5-5-2) ===== */
const PHASES = [
  { label: 'Breathe in',  ms: 5000, scale: 1.0 },
  { label: 'Breathe out', ms: 5000, scale: 0.62 },
  { label: 'Hold',        ms: 2000, scale: 0.62 }
];
const orbs   = ['#heroOrb', '#finaleOrb', '#miniCircle'].map(s => $(s)).filter(Boolean);
const labels = ['#heroLabel', '#miniLabel'].map(s => $(s)).filter(Boolean);
let phase = 0;
function runPhase() {
  const p = PHASES[phase];
  orbs.forEach(o => { o.style.transitionDuration = p.ms + 'ms'; o.style.transform = `scale(${p.scale})`; });
  labels.forEach(l => { l.textContent = p.label; });
  phase = (phase + 1) % PHASES.length;
  setTimeout(runPhase, p.ms);
}
orbs.forEach(o => { o.style.transitionDuration = '0ms'; o.style.transform = 'scale(0.62)'; });
requestAnimationFrame(() => setTimeout(runPhase, 60));

/* ===== reveal on scroll ===== */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach(el => revealObs.observe(el));

/* ===== scroll-spy ===== */
const tocLinks = $$('[data-target]');
const targets = tocLinks.map(a => $('#' + a.dataset.target)).filter(Boolean);
const sections = $$('.section');
const topbarSection = $('#topbarSection');

function setActive(id) {
  tocLinks.forEach(a => a.classList.toggle('is-active', a.dataset.target === id));
  // also highlight the parent section of a sub-item
  const el = document.getElementById(id);
  const sec = el && el.closest('.section');
  if (sec) {
    $$('.toc__item').forEach(a => a.classList.toggle('is-active', a.dataset.target === sec.id));
    if (topbarSection) topbarSection.textContent = sec.dataset.title || '';
  }
}
function onScroll() {
  const marker = window.innerHeight * 0.35;
  let current = targets[0] && targets[0].id;
  for (const t of targets) {
    if (t.getBoundingClientRect().top <= marker) current = t.id;
  }
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  if (max - window.scrollY < 4 && targets.length) current = targets[targets.length - 1].id; // at the very bottom: last section
  if (current) setActive(current);
  // progress bar
  $('#progressBar').style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

/* ===== mobile menu ===== */
const sidebar = $('#sidebar'), backdrop = $('#backdrop'), menuBtn = $('#menuBtn');
function closeMenu() { sidebar.classList.remove('is-open'); backdrop.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); }
function toggleMenu() { const open = !sidebar.classList.contains('is-open'); sidebar.classList.toggle('is-open', open); backdrop.classList.toggle('is-open', open); menuBtn.setAttribute('aria-expanded', String(open)); }
menuBtn.addEventListener('click', toggleMenu);
backdrop.addEventListener('click', closeMenu);
tocLinks.forEach(a => a.addEventListener('click', () => { if (window.matchMedia('(max-width: 900px)').matches) closeMenu(); }));

/* ===== 14-day timeline ===== */
const days = $('#timelineDays');
if (days) {
  for (let i = 1; i <= 14; i++) {
    const d = document.createElement('div');
    d.className = 'day';
    d.innerHTML = `<div class="day__num">DAY ${i}</div><div class="day__marks"><i class="m-day" title="Daytime breathing"></i><i class="m-night" title="8 pm questionnaire"></i></div>`;
    days.appendChild(d);
  }
}

/* ===== slider demo (3 → 10 minutes) ===== */
const sliderFill = $('#sliderFill'), sliderKnob = $('#sliderKnob'), sliderText = $('#sliderText');
if (sliderFill) {
  const demoObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      demoObs.disconnect();
      setTimeout(() => {
        sliderFill.style.width = '33%'; sliderKnob.style.left = '33%';
        let m = 3;
        const tick = setInterval(() => { m++; sliderText.textContent = m + ' minutes'; if (m >= 10) clearInterval(tick); }, 300);
      }, 500);
    });
  }, { threshold: 0.6 });
  demoObs.observe(sliderFill.closest('.slider-demo'));
}

/* ===== if-then plan ===== */
const feel = $('#planFeeling'), dur = $('#planDuration'), result = $('#planResult'), planText = $('#planText');
function updatePlan() {
  [feel, dur].forEach(s => s.classList.toggle('is-set', !!s.value));
  if (feel.value && dur.value) {
    planText.textContent = `If I feel ${feel.value} today, I will try ${dur.value} of 5-5-2 slow-paced breathing to help me settle.`;
    result.hidden = false;
  } else {
    result.hidden = true;
  }
}
[feel, dur].forEach(s => s.addEventListener('change', updatePlan));
