/**
 * Matrix Digital Rain Effect
 * Creates a falling code animation on a canvas element.
 *
 * Phone changes: lower frame rate, fewer columns, pauses when the tab is hidden,
 * and ignores height-only resizes (the on-screen keyboard fires those and used to
 * wipe the canvas every time it opened).
 */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) {
        console.error('Matrix canvas not found!');
        return;
    }

    // Respect "reduce motion" settings: plain black background
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');

    // Characters to use (Katakana + Latin + Numbers)
    const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charArray = chars.split('');

    const isPhone = window.matchMedia('(max-width: 768px)').matches;
    const fontSize = isPhone ? 16 : 14;     // bigger text means fewer columns on a phone
    const frameGap = isPhone ? 66 : 33;     // about 15 fps on phones, 30 fps on desktop

    let width = 0;
    let drops = [];
    let lastFrame = 0;
    let rafId = null;

    function setup() {
        width = window.innerWidth;
        canvas.width = width;
        canvas.height = window.innerHeight;

        const columns = Math.ceil(width / fontSize);
        drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -100; // start above the screen
        }
    }

    function draw(now) {
        rafId = requestAnimationFrame(draw);
        if (now - lastFrame < frameGap) return;
        lastFrame = now;

        // Semi-transparent black fill to create the trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0F0';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = charArray[Math.floor(Math.random() * charArray.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            ctx.fillText(text, x, y);

            // Reset drop to the top randomly after it crosses the bottom
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }

            drops[i]++;
        }
    }

    function start() {
        if (rafId === null) rafId = requestAnimationFrame(draw);
    }

    function stop() {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    setup();
    start();

    // Only rebuild when the width changes (rotation, window resize), not for the keyboard
    window.addEventListener('resize', () => {
        if (window.innerWidth !== width) setup();
    });

    // Stop drawing while the tab is in the background (saves battery)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else start();
    });
});
