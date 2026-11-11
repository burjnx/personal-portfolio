document.documentElement.classList.add('js');

// ---------- Fade sections in as they scroll into view ----------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ---------- Highlight the current section in the menu ----------
const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));

// ---------- Copy email / phone ----------
document.querySelectorAll('.copy').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(btn.dataset.copy).then(() => {
      btn.classList.add('done');
      setTimeout(() => btn.classList.remove('done'), 1600);
    }).catch(() => {});
  });
});
