// Configuration file for AI and API settings
const CONFIG = {
    // OpenAI Configuration
    OPENAI: {
        // Note: In production, this should be handled server-side
        // This is a placeholder - implement proper API proxy
        API_ENDPOINT: 'http://localhost:3001/api/openai', // Your backend endpoint
        MODEL: 'gpt-3.5-turbo',
        MAX_TOKENS: 150,
        TEMPERATURE: 0.7
    },

    // AI Features
    AI_FEATURES: {
        ENABLED: true,
        AUTO_CORRECT: true,
        SMART_SUGGESTIONS: true,
        CONTEXT_AWARENESS: true,
        FALLBACK_RESPONSES: true
    },

    // Command similarity threshold (0-1)
    SIMILARITY_THRESHOLD: 0.6,

    // Known commands for similarity matching
    VALID_COMMANDS: [
        'help', 'about', 'projects', 'skills', 'experience',
        'contact', 'education', 'certifications', 'leadership',
        'sudo', 'clear', 'whoami', 'ls', 'pwd', 'cat',
        'neofetch', 'status'
    ],

    // Common typos and corrections
    TYPO_CORRECTIONS: {
        'hep': 'help',
        'hlep': 'help',
        'halp': 'help',
        'abot': 'about',
        'abut': 'about',
        'skils': 'skills',
        'skill': 'skills',
        'experince': 'experience',
        'expirience': 'experience',
        'contect': 'contact',
        'conact': 'contact',
        'educaton': 'education',
        'clar': 'clear',
        'clr': 'clear',
        'stats': 'status',
        'stat': 'status'
    },

    // AI response templates
    RESPONSE_TEMPLATES: {
        COMMAND_NOT_FOUND: "I couldn't find that command. Did you mean",
        CORRECTING_TYPO: "I noticed a small typo. Let me correct that for you",
        AI_THINKING: "Let AI think...",
        AI_ERROR: "AI assistant is temporarily unavailable. Using fallback response."
    }
};

// Export for use in other files
window.CONFIG = CONFIG;
