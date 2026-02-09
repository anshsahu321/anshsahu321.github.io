/**
 * Matrix Digital Rain Effect
 * Creates a falling code animation on a canvas element
 */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) {
        console.error('Matrix canvas not found!');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Set canvas size to full screen
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Characters to use (Katakana + Latin + Numbers)
    const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charArray = chars.split('');

    // Font configuration
    const fontSize = 14;
    const columns = canvas.width / fontSize;

    // Array to track the y-coordinate of each column
    // Initialize with random starting positions for a more natural look
    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100; // Start above the screen
    }

    // Drawing function
    function draw() {
        // Semi-transparent black fill to create trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set text color and font
        ctx.fillStyle = '#0F0'; // Green
        ctx.font = fontSize + 'px monospace';

        // Loop over drops
        for (let i = 0; i < drops.length; i++) {
            // Random character
            const text = charArray[Math.floor(Math.random() * charArray.length)];

            // Draw the character
            // x = column index * font size
            // y = drop value * font size
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            ctx.fillText(text, x, y);

            // Reset drop to top randomly after it crosses bottom
            // Adding Math.random() > 0.975 adds randomness to the reset so they don't all look the same
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }

            // Increment y coordinate
            drops[i]++;
        }
    }

    // Animation loop (30 FPS for that classic feel)
    setInterval(draw, 33);
});
