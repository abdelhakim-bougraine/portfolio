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

init();
animate();