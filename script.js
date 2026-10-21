// ---------- Copy email / phone ----------
function setupCopy(containerId, textId, msgId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.addEventListener('click', () => {
    const text = document.getElementById(textId).textContent.trim();
    const msg = document.getElementById(msgId);
    const show = () => {
      msg.classList.add('show');
      setTimeout(() => msg.classList.remove('show'), 2000);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(show).catch(() => {});
    }
  });
}
setupCopy('email-container', 'emailAddr', 'copied-msg');
setupCopy('phone-container', 'phoneN0', 'copiedN0');

// ---------- Message button -> contact section ----------
document.getElementById('message-btn').addEventListener('click', () => {
  document.getElementById('contacts').scrollIntoView({ behavior: 'smooth' });
});

// ---------- Mobile menu ----------
const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelectorAll('.nav-link');

function closeMenu() {
  header.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}
menuToggle.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
navLinks.forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', (e) => {
  if (!header.contains(e.target)) closeMenu();
});

// ---------- Active nav link + animated heading ----------
const logo = document.querySelector('.logo');
const underline = document.querySelector('.underline');
const bg = document.querySelector('.current-select');
const nav = document.querySelector('.navbar');
const hasGsap = typeof gsap !== 'undefined';

function moveBackgroundNav(el) {
  if (!el || getComputedStyle(bg).display === 'none') return;
  const rect = el.getBoundingClientRect();
  const navRect = nav.getBoundingClientRect();
  const centre = rect.left + rect.width / 2 - navRect.left;
  bg.style.left = `${centre - bg.offsetWidth / 2}px`;
}

function setActive(id) {
  const link = document.querySelector(`.nav-link[href="#${id}"]`);
  if (!link || link.classList.contains('active')) return;
  navLinks.forEach(l => l.classList.remove('active'));
  link.classList.add('active');
  moveBackgroundNav(link);
  logo.textContent = link.dataset.displayText;
  if (hasGsap) {
    gsap.fromTo(logo, { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 });
    gsap.fromTo(underline, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.out' });
  }
}

// A section counts as "current" when it crosses the middle of the screen,
// which works however tall the section is.
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) setActive(entry.target.id);
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
document.querySelectorAll('section').forEach(s => sectionObserver.observe(s));

function updateNavBackground() {
  moveBackgroundNav(document.querySelector('.nav-link.active'));
}
window.addEventListener('load', () => {
  updateNavBackground();
  if (underline) underline.style.transform = 'scaleX(1)';
});
window.addEventListener('resize', () => {
  updateNavBackground();
  if (window.innerWidth > 1100) closeMenu();
});

// ---------- Skill dials ----------
function animateKnob(card, total = 60) {
  if (card.dataset.done) return;          // run once only
  card.dataset.done = '1';
  const target = Number(card.dataset.target) || 0;
  const needle = card.querySelector('.needle');
  const percentText = card.querySelector('.percentage-text');
  const ticks = card.querySelector('.ticks');
  ticks.innerHTML = '';

  const segments = [];
  for (let i = 0; i < total; i++) {
    const tick = document.createElement('div');
    tick.className = 'segment';
    tick.style.transform = `rotate(${(360 / total) * i}deg) translateY(-6rem)`;
    tick.style.background = `hsl(${(120 * i) / (total - 1)}, 100%, 45%)`;
    ticks.appendChild(tick);
    segments.push(tick);
  }

  let n = 0;
  const timer = setInterval(() => {
    if (n >= target) { clearInterval(timer); return; }
    segments[n].classList.add('active');
    needle.style.transform = `rotate(${(360 / total) * n}deg)`;
    n++;
    percentText.textContent = `${Math.round((n / total) * 100)}%`;
  }, 30);
}

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) animateKnob(entry.target);
  });
}, { threshold: 0.4 });
document.querySelectorAll('.fskillrate').forEach(card => skillObserver.observe(card));

// ---------- Education / Experience timeline animation ----------
// Each circle rises from the bottom of its line to its place, then that
// entry's date, title and description ease in one line at a time.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setupTimeline(list) {
  const items = [...list.querySelectorAll('li')];
  if (!hasGsap || reduceMotion || !items.length) return;   // everything just shows normally

  // Split each entry into lines: date, title, description
  const lines = items.map(li => {
    const what = li.querySelector('.what');
    const strong = what.querySelector('strong');
    const desc = document.createElement('span');
    [...what.childNodes].filter(n => n !== strong).forEach(n => desc.appendChild(n));
    what.appendChild(desc);
    const parts = [li.querySelector('.when'), strong, desc];
    parts.forEach(el => el.classList.add('tl-line'));
    return parts;
  });
  list.classList.add('tl-ready');

  // Each circle starts at the bottom of the line, hidden
  const startOffsets = items.map(li => {
    const top = li.offsetTop + parseFloat(getComputedStyle(li, '::before').top);
    const size = parseFloat(getComputedStyle(li, '::before').height);
    return Math.max(0, list.offsetHeight - top - size);
  });
  items.forEach((li, i) => gsap.set(li, { '--dy': `${startOffsets[i]}px`, '--co': 0 }));

  const play = () => {
    const tl = gsap.timeline();
    items.forEach((li, i) => {
      tl.to(li, { '--dy': '0px', '--co': 1, duration: 1.2, ease: 'power2.out' }, i ? '-=0.5' : 0)
        .to(lines[i], { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.25 }, '-=0.35');
    });
  };

  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      io.disconnect();          // play once only
      play();
    }
  }, { threshold: 0.35 });
  io.observe(list);
}
document.querySelectorAll('.timeline').forEach(setupTimeline);

// ---------- Details pop-ups ----------
// Any element with data-dialog="<id>" opens that pop-up
document.querySelectorAll('[data-dialog]').forEach(trigger => {
  const dialog = document.getElementById(trigger.dataset.dialog);
  if (!dialog || typeof dialog.showModal !== 'function') return;
  trigger.addEventListener('click', () => {
    dialog.showModal();
    dialog.querySelector('.dialog-inner').scrollTop = 0;
    document.body.classList.add('dialog-open');
  });
});
document.querySelectorAll('.details-dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  // Click on the dark backdrop closes it
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
});

// ---------- Project filters ----------
const filterButtons = document.querySelectorAll('.filter-btn');
const projects = document.querySelectorAll('.project');
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    projects.forEach(project => {
      const match = filter === 'all' || project.dataset.category.split(' ').includes(filter);
      project.style.display = match ? '' : 'none';
    });
  });
});

// ---------- Contact form: floating labels ----------
document.querySelectorAll('.contact-input').forEach((input) => {
  const wrap = input.parentNode;
  input.addEventListener('focus', () => wrap.classList.add('focus', 'not-empty'));
  input.addEventListener('blur', () => {
    wrap.classList.remove('focus');
    if (input.value === '') wrap.classList.remove('not-empty');
  });
});

// ---------- Contact form: send via the visitor's email app ----------
// GitHub Pages has no server, so the form opens a pre-filled email instead.
document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  const name = `${f.firstName.value.trim()} ${f.lastName.value.trim()}`;
  const subject = `Portfolio message from ${name}`;
  const body = `${f.message.value.trim()}\n\n${name}\n${f.email.value.trim()}`;
  window.location.href =
    `mailto:adulojutadelolaburj@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
