// scatter tiny floating sparkle stars across the background (runs on every page)
const starsField = document.getElementById('starsField');
if (starsField) {
  const STAR_COUNT = 45;
  for (let i = 0; i < STAR_COUNT; i++) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.classList.add('star-sparkle');
    const size = 4 + Math.random() * 14;
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const duration = 3 + Math.random() * 5;
    const delay = Math.random() * 5;
    s.setAttribute('width', size);
    s.setAttribute('height', size);
    s.style.top = top + '%';
    s.style.left = left + '%';
    s.style.opacity = (0.3 + Math.random() * 0.5).toString();
    s.style.animationDuration = duration + 's';
    s.style.animationDelay = delay + 's';

    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#sparkleShape');
    use.setAttribute('href', '#sparkleShape');
    s.appendChild(use);
    starsField.appendChild(s);
  }
}

// music box only exists on the main invitation page
const boxWrap = document.getElementById('boxWrap');
const bgm = document.getElementById('bgm');
const scrollCue = document.getElementById('scrollCue');

if (boxWrap) {
  boxWrap.addEventListener('click', () => {
    if (boxWrap.classList.contains('open')) return;
    boxWrap.classList.add('open');
    if (bgm) bgm.play().catch(() => {});
    if (scrollCue) setTimeout(() => scrollCue.classList.add('show'), 1200);
  });
}

// keep the music playing across page navigations (details.html, ceremony.html, etc.)
const BGM_TIME_KEY = 'bgmTime';
const BGM_PLAYING_KEY = 'bgmPlaying';

if (bgm) {
  const savedTime = parseFloat(sessionStorage.getItem(BGM_TIME_KEY) || '0');
  const wasPlaying = sessionStorage.getItem(BGM_PLAYING_KEY) === '1';

  if (savedTime > 0) {
    bgm.currentTime = savedTime;
  }

  if (wasPlaying) {
    // came from another page where the music was already going — resume it
    if (boxWrap) boxWrap.classList.add('open');
    bgm.play().catch(() => showResumeButton());
  }

  bgm.addEventListener('timeupdate', () => {
    sessionStorage.setItem(BGM_TIME_KEY, bgm.currentTime.toString());
  });
  bgm.addEventListener('play', () => sessionStorage.setItem(BGM_PLAYING_KEY, '1'));
  bgm.addEventListener('pause', () => sessionStorage.setItem(BGM_PLAYING_KEY, '0'));

  window.addEventListener('pagehide', () => {
    sessionStorage.setItem(BGM_TIME_KEY, bgm.currentTime.toString());
    sessionStorage.setItem(BGM_PLAYING_KEY, bgm.paused ? '0' : '1');
  });
}

function showResumeButton() {
  if (document.querySelector('.resume-music-btn')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'resume-music-btn';
  btn.textContent = '♪ tap to resume music';
  btn.addEventListener('click', () => {
    bgm.play().catch(() => {});
    btn.remove();
  });
  document.body.appendChild(btn);
}

const cards = document.querySelectorAll('.card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.25 });
cards.forEach(c => observer.observe(c));
