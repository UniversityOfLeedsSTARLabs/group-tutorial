/* ------------------------------------------------------------------
   Understanding Stress tutorial (PE group) · behaviour
   ------------------------------------------------------------------ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ===== YouTube embeds (IDs are set on each .video__frame via data-video-id) ===== */
$$('.video__frame[data-video-id]').forEach(frame => {
  const id = frame.dataset.videoId;
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
  iframe.title = frame.closest('.vcard')?.querySelector('.vcard__title')?.textContent || 'Video';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  iframe.loading = 'lazy';
  frame.appendChild(iframe);
});

/* ===== reveal on scroll ===== */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach(el => revealObs.observe(el));

/* ===== scroll-spy + progress bar ===== */
const tocLinks = $$('[data-target]');
const targets = tocLinks.map(a => $('#' + a.dataset.target)).filter(Boolean);
const topbarSection = $('#topbarSection');
function setActive(id) {
  tocLinks.forEach(a => a.classList.toggle('is-active', a.dataset.target === id));
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
  for (const t of targets) if (t.getBoundingClientRect().top <= marker) current = t.id;
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  if (max - window.scrollY < 4 && targets.length) current = targets[targets.length - 1].id; // at the very bottom: last section
  if (current) setActive(current);
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

/* ===== 14-day timeline (evening questionnaire only) ===== */
const days = $('#timelineDays');
if (days) {
  for (let i = 1; i <= 14; i++) {
    const d = document.createElement('div');
    d.className = 'day';
    d.innerHTML = `<div class="day__num">DAY ${i}</div><div class="day__marks day__marks--single"><i class="m-night" title="8 pm questionnaire"></i></div>`;
    days.appendChild(d);
  }
}

/* ===== watched checklist (stays on this device only; nothing is sent) ===== */
const KEY = 'pe-tutorial-watched';
const boxes = $$('input[data-watch]');
function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable: ignore */ } }
function renderWatched() {
  const on = boxes.filter(b => b.checked).map(b => b.dataset.watch);
  boxes.forEach(b => {
    const card = b.closest('.vcard'), label = b.closest('.watched');
    card.classList.toggle('is-watched', b.checked);
    label.classList.toggle('is-on', b.checked);
    label.querySelector('.watched__text').textContent = b.checked ? 'Watched' : 'Mark as watched';
    const pip = $(`.pip[data-pip="${b.dataset.watch}"]`); if (pip) pip.classList.toggle('is-on', b.checked);
  });
  $('#wpCount').textContent = `${on.length} / ${boxes.length}`;
  $('#wpFill').style.width = (on.length / boxes.length * 100) + '%';
  $('#doneCard').hidden = on.length < boxes.length;
  save(on);
}
const saved = load();
boxes.forEach(b => { b.checked = saved.includes(b.dataset.watch); b.addEventListener('change', renderWatched); });
renderWatched();
