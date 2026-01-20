const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.zIndex = '-1'
canvas.style.pointerEvents = 'none';

let dots = [];
const dotCount = 100;
const maxDistance = 150;
let mouse = { x: null, y: null };

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

resize();


class Dot {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212, 175, 55, 0.8)'
        ctx.fill();
    }
}

function init() {
    for (let i = 0; i < dotCount; i++) {
        dots.push(new Dot());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dots.forEach((dot, index) => {
        dot.update();
        dot.draw();


        for (let j = index + 1; j < dots.length; j++) {
            const d2 = dots[j];
            const dist = Math.hypot(dot.x - d2.x, dot.y - d2.y);

            if (dist < maxDistance) {
                ctx.beginPath();
                ctx.moveTo(dot.x, dot.y);
                ctx.lineTo(d2.x, d2.y);

                ctx.strokeStyle = `rgba(212, 175, 55, ${1 - dist / maxDistance})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
        const distMouse = Math.hypot(dot.x - mouse.x, dot.y - mouse.y);
        if (distMouse < maxDistance + 50) {
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(212, 175, 55, 0.5)`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    });

    requestAnimationFrame(animate);
}

function initMobileNav() {
    const toggle = document.getElementById('mobile-nav-toggle');
    const navLinks = document.getElementById('nav-links');
    const navBackdrop = document.getElementById('nav-backdrop');
    if (!toggle || !navLinks) return;

    const firstFocusable = () => navLinks.querySelector('a, button');

    function openMobile() {
        // prepare for animation
        navLinks.classList.remove('hidden');
        // mark as open (used by CSS to set full-black background on mobile)
        navLinks.classList.add('is-open');
        if (navBackdrop) { navBackdrop.classList.add('show'); navBackdrop.setAttribute('aria-hidden','false'); }
        navLinks.setAttribute('aria-hidden','false');
        // allow a frame for layout then add mobile-open to animate
        requestAnimationFrame(() => navLinks.classList.add('mobile-open'));
        toggle.setAttribute('aria-expanded', 'true');
        // focus first link for keyboard users
        setTimeout(() => { const f = firstFocusable(); if (f && window.innerWidth < 640) f.focus(); }, 100);
        document.addEventListener('keydown', onKeyDown);
        // click on backdrop closes menu
        if (navBackdrop) navBackdrop.addEventListener('click', closeMobile);
    }

    function closeMobile() {
        navLinks.classList.remove('mobile-open');
        // remove open marker
        navLinks.classList.remove('is-open');
        if (navBackdrop) { navBackdrop.classList.remove('show'); navBackdrop.setAttribute('aria-hidden','true'); }
        navLinks.setAttribute('aria-hidden','true');
        toggle.setAttribute('aria-expanded', 'false');
        document.removeEventListener('keydown', onKeyDown);
        // after transition end hide completely
        const onEnd = () => {
            if (window.innerWidth < 640) navLinks.classList.add('hidden');
            navLinks.removeEventListener('transitionend', onEnd);
        };
        navLinks.addEventListener('transitionend', onEnd);
        if (navBackdrop) navBackdrop.removeEventListener('click', closeMobile);
    }

    function onKeyDown(e) {
        if (e.key === 'Escape') {
            closeMobile();
            toggle.focus();
            return;
        }

        if (e.key === 'Tab' && window.innerWidth < 640) {
            const focusable = Array.from(navLinks.querySelectorAll('a, button')).filter(el => el.offsetParent !== null);
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }

    toggle.addEventListener('click', () => {
        if (navLinks.classList.contains('mobile-open')) closeMobile();
        else openMobile();
    });

    // make Enter/Space activate the hamburger
    toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); }
    });

    // Close menu when a nav link is clicked (only on small screens)
    navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            if (window.innerWidth < 640) closeMobile();
        });
    });

    // Keep state consistent on resize
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 640) {
            // ensure normal desktop layout
            navLinks.classList.remove('hidden');
            navLinks.classList.remove('mobile-open');
            navLinks.classList.remove('is-open');
            if (navBackdrop) { navBackdrop.classList.remove('show'); navBackdrop.setAttribute('aria-hidden','true'); }
            toggle.setAttribute('aria-expanded', 'false');
            document.removeEventListener('keydown', onKeyDown);
        } else {
            // hide by default on mobile unless explicitly open
            if (!navLinks.classList.contains('mobile-open')) navLinks.classList.add('hidden');
        }
    });
}

// Fallback/simple toggle to ensure hamburger always opens/closes the menu.
function ensureSimpleToggle() {
    const toggle = document.getElementById('mobile-nav-toggle');
    const navLinks = document.getElementById('nav-links');
    const backdrop = document.getElementById('nav-backdrop');
    if (!toggle || !navLinks) return;

    function setOpenState(open) {
        if (open) {
            navLinks.classList.add('is-open');
            navLinks.classList.add('mobile-open');
            navLinks.classList.remove('hidden');
            navLinks.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-expanded', 'true');
            if (backdrop) { backdrop.classList.add('show'); backdrop.setAttribute('aria-hidden','false'); }
        } else {
            navLinks.classList.remove('is-open');
            navLinks.classList.remove('mobile-open');
            navLinks.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            if (backdrop) { backdrop.classList.remove('show'); backdrop.setAttribute('aria-hidden','true'); }
            // hide after transition when on small screens (existing code handles this too)
            if (window.innerWidth < 640) setTimeout(() => navLinks.classList.add('hidden'), 320);
        }
    }

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navLinks.classList.contains('is-open');
        setOpenState(!isOpen);
    });

    // keyboard support
    toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); }
    });
}

async function loadNav() {
    try {
        const res = await fetch('nav.html', { cache: 'no-cache' });
        if (!res.ok) return;
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newNav = doc.querySelector('nav');
        if (!newNav) return;

        const placeholder = document.getElementById('nav-placeholder');
        if (placeholder) {
            placeholder.replaceWith(newNav);
        } else {
            // if no placeholder, replace the first existing nav or insert at top
            const existingNav = document.querySelector('nav');
            if (existingNav) existingNav.replaceWith(newNav.cloneNode(true));
            else document.body.insertBefore(newNav, document.body.firstChild);
        }

        // init mobile behavior now that elements exist
        initMobileNav();
        initTabToggles();
        initPressFeedback();
        initBrandMenu();
        // ensure a simple toggle exists as a fallback
        ensureSimpleToggle();
        initActiveOnScroll();
        setActiveFromHash();

    } catch (err) {
        // fetch failed, ignore — pages already have nav fallback
        console.warn('Could not load shared nav:', err);
        // initialize behavior on any existing nav already present in the page
        try {
            initMobileNav();
            initTabToggles();
            initPressFeedback();
            initBrandMenu();
            ensureSimpleToggle();
            initActiveOnScroll();
            setActiveFromHash();
        } catch (e) { /* ignore if functions are not available */ }
    }
}

// Load the nav once DOM is ready so placeholders are present.
window.addEventListener('DOMContentLoaded', loadNav);

init();
animate();

const toggleBtn = document.getElementById("mobile-nav-toggle");
const mobileMenu = document.getElementById("mobile-menu");

toggleBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});