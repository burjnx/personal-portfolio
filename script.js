document.getElementById("email-container").addEventListener('click', function() {
    const email = document.getElementById("emailAddr").textContent;

    navigator.clipboard.writeText(email).then(() => {
        const copiedMsg = document.getElementById("copied-msg");
        copiedMsg.style.display = "inline";

        setTimeout(() => {
            copiedMsg.style.display = "none";
        }, 2000);
    });
});

document.getElementById("phone-container").addEventListener('click', function() {
    const phone = document.getElementById("phoneN0").textContent;

    navigator.clipboard.writeText(phone).then(() => {
        const copiedMsg = document.getElementById("copiedN0");
        copiedMsg.style.display = "inline";

        setTimeout(() => {
            copiedMsg.style.display = "none";
        }, 2000);
    });
});

// active nav-bar
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');
const current = document.querySelector('.logo');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));

      const id = entry.target.getAttribute('id');
      const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
      if (activeLink) {
        // navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
      
        const displayText = activeLink.dataset.displayText;
        if (displayText) {

          current.textContent = displayText;


          gsap.fromTo(current, 
            { x: 20, opacity: 0 }, 
            { 
              x: 0, 
              opacity: 1, 
              duration: 0.4, 
              onStart: () => {
                current.textContent = displayText;
              }
            }
          );
          const underline = document.querySelector('.underline');

          gsap.fromTo(underline, 
            { scaleX: 0 }, 
            { 
              scaleX: 1, 
              duration: 0.5, 
              ease: "power2.out" 
            }
          );
          
        }
      }
      
    }
  });
}, {
  threshold: 0.6
});

sections.forEach(section => {
  observer.observe(section);
});

const nav = document.querySelector('.header');
const bg = document.querySelector('.current-select');

function moveBackgroundNav(el) {
  const rect = el.getBoundingClientRect();
  const navRect = nav.getBoundingClientRect();

  const centerOfEl = rect.left + rect.width / 2;
  const offsetLeft = centerOfEl - navRect.left;

  const bgWidth = bg.offsetWidth;
  bg.style.left = `${offsetLeft - bgWidth / 2}px`;
};

function updateNavBackground() {
  const active = document.querySelector('.nav-link.active');
    if (active) moveBackgroundNav(active);
};

window.addEventListener('load', updateNavBackground);
window.addEventListener('resize', updateNavBackground);
window.addEventListener('scroll', updateNavBackground);

function animateKnob(knobId, percentageSelector, total = 100, target = 70) {
  const knob = document.getElementById(knobId);
  const needle = knob.querySelector('.needle');
  const percentageText = knob.closest('.fskillrate').querySelector(percentageSelector);
  const ticksContainer = knob.closest('.fskillrate').querySelector('.ticks');

  // Clear previous ticks if any
  ticksContainer.innerHTML = '';

  const segments = [];
  for (let i = 0; i < total; i++) {
      const tick = document.createElement('div');
      tick.className = 'segment';
      tick.style.transform = `rotate(${(360 / total) * i}deg) translateY(-6rem)`; // Adjust radius if needed

      const hue = (120 * i) / (total - 1); // green to red
      tick.style.background = `hsl(${hue}, 100%, 50%)`;

      ticksContainer.appendChild(tick);
      segments.push(tick);
  }

  let currentNo = 0;
  const interval = setInterval(() => {
      if (currentNo >= target) {
          clearInterval(interval);
          return;
      }

      segments[currentNo].classList.add('active');

      const rotateDeg = (360 / total) * currentNo;
      needle.style.transform = `rotate(${rotateDeg}deg)`;

      const percent = Math.round((currentNo / total) * 100);
      percentageText.textContent = `${percent}%`;

      currentNo++;
  }, 30); // Speed of animation
}

const skillsSection = document.querySelector('.skills'); // The section containing the knobs
const observered = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Triggering the knob animations when the section is in view
      animateKnob('knob1', '.percentage-text', 60, 49);
      animateKnob('knob2', '.percentage-text', 60, 49);
      animateKnob('knob3', '.percentage-text', 60, 30);
      animateKnob('knob4', '.percentage-text', 60, 30);
      animateKnob('knob5', '.percentage-text', 60, 30);
      animateKnob('knob6', '.percentage-text', 60, 10);
    }
  });
}, {
  threshold: 0.5 // Trigger when 50% of the section is visible
});

// Observe the skills section
observered.observe(skillsSection);


function scrollCarousel(direction) {
  const container = document.getElementById("carousel");
  const item = container.querySelector(".fskillrate");
  const itemWidth = item.offsetWidth;

  const scrollAmount = itemWidth * 3; // no gap included

  container.scrollBy({
    left: direction * scrollAmount,
    behavior: "smooth"
  });

  setTimeout(checkArrows, 500);  // Check arrows visibility after scrolling
}


function checkArrows() {
  const container = document.getElementById("carousel");
  const leftArrow = document.querySelector(".arrow-left");
  const rightArrow = document.querySelector(".arrow-right");

  // Check if we're at the start (leftmost) or end (rightmost)
  const atStart = container.scrollLeft === 0;
  const atEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth;

  // Disable arrows based on scroll position
  leftArrow.style.display = atStart ? 'none' : 'block';  // Hide left arrow if at the start
  rightArrow.style.display = atEnd ? 'none' : 'block';  // Hide right arrow if at the end
}

// Call this on page load to set initial state of arrows
window.onload = checkArrows;


const filterButtons = document.querySelectorAll('.filter-btn');
const projects = document.querySelectorAll('.project');

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const filter = button.getAttribute('data-filter');

    projects.forEach(project => {
      const categories = project.getAttribute('data-category').split(' ');

      if (filter === 'all' || categories.includes(filter)) {
        project.style.display = 'block';
      } else {
        project.style.display = 'none';
      }
    });
  });
});

const inputs = document.querySelectorAll('.contact-input');

inputs.forEach((ipt) => {
  ipt.addEventListener('focus', () => {
    ipt.parentNode.classList.add('focus');
    ipt.parentNode.classList.add('not-empty');
  });
  ipt.addEventListener("blur", () => {
    if (ipt.value === "") {
      ipt.parentNode.classList.remove('not-empty');
    }
    ipt.parentNode.classList.remove('focus');
  });
});
