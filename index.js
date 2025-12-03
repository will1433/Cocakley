// Home page scroll/hero animation
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.section');

  // Reveal sections when they enter the viewport
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -10% 0px' }
  );

  sections.forEach((sec, i) => {
    sec.style.setProperty('--delay', `${i * 80}ms`);
    io.observe(sec);
  });

  const hero = document.querySelector('.hero-home');
  if (hero) {
    hero.classList.add('hero-ready');
  }
});
