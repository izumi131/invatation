// scatter tiny floating sparkle stars across the background
const starsField = document.getElementById('starsField');
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

const boxWrap = document.getElementById('boxWrap');
const bgm = document.getElementById('bgm');
const scrollCue = document.getElementById('scrollCue');

boxWrap.addEventListener('click', () => {
  if (boxWrap.classList.contains('open')) return;
  boxWrap.classList.add('open');
  bgm.play().catch(() => {});
  setTimeout(() => scrollCue.classList.add('show'), 1200);
});

const card = document.getElementById('card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) card.classList.add('visible');
  });
}, { threshold: 0.25 });
observer.observe(card);
