class TypingAnimator {
    constructor() {
        this.isAnimating = false;
        this.currentAnimation = null;
        this.defaultSpeed = 50;
        this.fastSpeed = 20;
        this.slowSpeed = 100;
        this.pauseDuration = 300;
    }

    // Main typing animation method
    async typeText(element, text, options = {}) {
        const config = {
            speed: options.speed || this.defaultSpeed,
            cursor: options.cursor !== false,
            sound: options.sound || false,
            onComplete: options.onComplete || null,
            onCharacter: options.onCharacter || null,
            pauseOnPunctuation: options.pauseOnPunctuation !== false
        };

        if (this.isAnimating) {
            this.stopCurrentAnimation();
        }

        this.isAnimating = true;
        element.textContent = '';

        if (config.cursor) {
            this.addCursor(element);
        }

        try {
            await this.animateText(element, text, config);

            if (config.onComplete) {
                config.onComplete();
            }
        } catch (error) {
            console.error('Typing animation error:', error);
        } finally {
            this.isAnimating = false;
            if (config.cursor) {
                this.removeCursor(element);
            }
        }
    }

    async animateText(element, text, config) {
        const textContent = element.childNodes[0]; // Text node before cursor

        for (let i = 0; i < text.length; i++) {
            if (!this.isAnimating) break; // Animation was stopped

            const char = text[i];

            // Add character
            if (textContent) {
                textContent.textContent += char;
            } else {
                element.insertBefore(document.createTextNode(char), element.firstChild);
            }

            // Visual feedback for new character
            this.flashCharacter(element);

            // Sound effect (if enabled)
            if (config.sound) {
                this.playTypingSound();
            }

            // Character callback
            if (config.onCharacter) {
                config.onCharacter(char, i);
            }

            // Dynamic speed based on character type
            let delay = config.speed;
            if (config.pauseOnPunctuation && this.isPunctuation(char)) {
                delay = this.pauseDuration;
            }

            await this.sleep(delay + this.getRandomVariation());
        }
    }

    // AI-specific typing animation
    async typeAIResponse(element, text, options = {}) {
        const aiConfig = {
            speed: this.slowSpeed,
            cursor: true,
            sound: false,
            pauseOnPunctuation: true,
            aiMode: true,
            ...options
        };

        // Add AI indicator
        const aiIndicator = this.createAIIndicator();
        element.appendChild(aiIndicator);

        // Show thinking phase
        await this.showAIThinking(element, aiConfig.thinkingTime || 1500);

        // Remove indicator and start typing
        aiIndicator.remove();

        await this.typeText(element, text, aiConfig);
    }

    async typeCorrection(element, originalText, correctedText, options = {}) {
        const correctionConfig = {
            speed: this.fastSpeed,
            highlightCorrection: true,
            ...options
        };

        // Type original text first (with strikethrough effect)
        element.innerHTML = `<span class="original-command">${originalText}</span>`;

        await this.sleep(500);

        // Add correction
        const correctionSpan = document.createElement('span');
        correctionSpan.className = 'correction-suggestion';
        element.appendChild(document.createTextNode(' → '));
        element.appendChild(correctionSpan);

        await this.typeText(correctionSpan, correctedText, correctionConfig);
    }

    // Utility methods
    addCursor(element) {
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        cursor.textContent = '|';
        element.appendChild(cursor);
    }

    removeCursor(element) {
        const cursor = element.querySelector('.typing-cursor');
        if (cursor) {
            cursor.remove();
        }
    }

    flashCharacter(element) {
        element.style.boxShadow = '0 0 5px rgba(16, 185, 129, 0.5)';
        setTimeout(() => {
            element.style.boxShadow = 'none';
        }, 100);
    }

    createAIIndicator() {
        const indicator = document.createElement('span');
        indicator.className = 'ai-typing-indicator';
        indicator.innerHTML = '🧠 <em>AI processing...</em>';
        return indicator;
    }

    async showAIThinking(element, duration) {
        const thinkingDots = document.createElement('span');
        thinkingDots.className = 'thinking-dots';
        thinkingDots.textContent = '...';
        element.appendChild(thinkingDots);

        // Animate dots
        let dotCount = 0;
        const interval = setInterval(() => {
            dotCount = (dotCount + 1) % 4;
            thinkingDots.textContent = '.'.repeat(dotCount || 1);
        }, 500);

        await this.sleep(duration);
        clearInterval(interval);
        thinkingDots.remove();
    }

    playTypingSound() {
        // Simple typing sound (you can replace with actual audio)
        if (window.AudioContext || window.webkitAudioContext) {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            } catch (error) {
                // Audio not supported or blocked
            }
        }
    }

    isPunctuation(char) {
        return /[.!?;:,]/.test(char);
    }

    getRandomVariation() {
        return Math.random() * 20 - 10; // ±10ms variation
    }

    stopCurrentAnimation() {
        this.isAnimating = false;
        if (this.currentAnimation) {
            clearTimeout(this.currentAnimation);
        }
    }

    sleep(ms) {
        return new Promise(resolve => {
            this.currentAnimation = setTimeout(resolve, ms);
        });
    }

    // Preset animations for different scenarios
    async typeError(element, errorText) {
        await this.typeText(element, errorText, {
            speed: this.fastSpeed,
            cursor: false,
            sound: false
        });
    }

    async typeSuccess(element, successText) {
        await this.typeText(element, successText, {
            speed: this.defaultSpeed,
            cursor: false,
            sound: false
        });
    }

    async typeCommand(element, command) {
        await this.typeText(element, command, {
            speed: this.fastSpeed,
            cursor: true,
            sound: true
        });
    }
}

// CSS for typing animations (add to your style.css)
const typingStyles = `
.typing-cursor {
    animation: typingBlink 1s infinite;
    color: #10b981;
}

@keyframes typingBlink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}

.ai-typing-indicator {
    color: #3b82f6;
    font-style: italic;
    animation: aiPulse 1.5s ease-in-out infinite;
}

@keyframes aiPulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
}

.thinking-dots {
    color: #10b981;
    font-weight: bold;
}

.original-command {
    text-decoration: line-through;
    opacity: 0.6;
    color: #ef4444;
}

.correction-suggestion {
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
    padding: 2px 4px;
    border-radius: 3px;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = typingStyles;
    document.head.appendChild(styleSheet);
}

// Export for use in other files
window.TypingAnimator = TypingAnimator;
