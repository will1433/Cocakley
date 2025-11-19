// home.js
// Simple "scroll in" animation for sections + small hero intro

document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.section');

  // IntersectionObserver: when section enters viewport, add .show
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          // once shown, we don't need to watch it anymore
          io.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  sections.forEach((sec, i) => {
    // small stagger using CSS variable
    sec.style.setProperty('--delay', `${i * 80}ms`);
    io.observe(sec);
  });

  // Tiny hero entrance: fade/slide after load
  const hero = document.querySelector('.hero-home');
  if (hero) {
    hero.classList.add('hero-ready');
  }

  // index.js
// Simple fade/slide-in animation for sections

document.addEventListener("DOMContentLoaded", () => {
  console.log("index.js loaded"); // check console

  const sections = document.querySelectorAll(".section");

  sections.forEach((sec, i) => {
    sec.style.setProperty("--delay", `${i * 80}ms`);
    sec.classList.add("fade-section");
  });

  // hero animation
  const hero = document.querySelector(".hero-home");
  if (hero) {
    hero.classList.add("hero-ready");
  }
});

});
