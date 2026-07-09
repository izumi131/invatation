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
