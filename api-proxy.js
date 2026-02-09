const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", "https://api.openai.com"]
        }
    }
}));

// CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Compression and logging
app.use(compression());
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    max: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE) || 10,
    message: {
        error: 'Too many requests, please try again later.',
        retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000) / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false
});

if (process.env.ENABLE_RATE_LIMITING === 'true') {
    app.use('/api/', limiter);
}

// OpenAI API proxy endpoint
app.post('/api/openai', async (req, res) => {
    try {
        const { input, prompt, context } = req.body;

        // Validate request
        if (!input || typeof input !== 'string') {
            return res.status(400).json({
                error: 'Invalid input provided',
                code: 'INVALID_INPUT'
            });
        }

        // Mock response for development/testing
        if (process.env.MOCK_AI_RESPONSES === 'true') {
            return res.json({
                response: getMockResponse(input),
                usage: { tokens: 25 },
                model: 'mock-gpt-3.5-turbo'
            });
        }

        // Validate OpenAI API key
        if (!process.env.OPENAI_API_KEY) {
            console.error('OpenAI API key not configured');
            return res.status(500).json({
                error: 'AI service temporarily unavailable',
                code: 'SERVICE_UNAVAILABLE'
            });
        }

        // Prepare OpenAI request
        const openaiRequest = {
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: buildSystemPrompt(context)
                },
                {
                    role: 'user',
                    content: `User typed: "${input}". ${prompt || ''}`
                }
            ],
            max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 150,
            temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        };

        // Make request to OpenAI
        const fetch = (await import('node-fetch')).default;
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
                'OpenAI-Organization': process.env.OPENAI_ORG_ID || ''
            },
            body: JSON.stringify(openaiRequest),
            timeout: parseInt(process.env.OPENAI_TIMEOUT) || 10000
        });

        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.json().catch(() => ({}));
            console.error('OpenAI API error:', errorData);

            return res.status(openaiResponse.status).json({
                error: 'AI service error',
                code: 'OPENAI_ERROR',
                details: process.env.DEBUG_MODE === 'true' ? errorData : undefined
            });
        }

        const data = await openaiResponse.json();
        const response = data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t process that request.';

        // Log successful request (optional)
        if (process.env.ENABLE_LOGGING === 'true') {
            console.log(`AI request processed: "${input}" -> "${response.substring(0, 50)}..."`);
        }

        res.json({
            response: response.trim(),
            usage: data.usage,
            model: data.model
        });

    } catch (error) {
        console.error('API proxy error:', error);

        res.status(500).json({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR',
            details: process.env.DEBUG_MODE === 'true' ? error.message : undefined
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: {
            ai: process.env.ENABLE_AI_FEATURES === 'true',
            rateLimit: process.env.ENABLE_RATE_LIMITING === 'true',
            logging: process.env.ENABLE_LOGGING === 'true'
        }
    });
});

// Command suggestions endpoint
app.post('/api/suggest', (req, res) => {
    const { input, context } = req.body;

    // Simple suggestion logic (you can enhance this)
    const suggestions = generateSuggestions(input, context);

    res.json({
        suggestions,
        input,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);

    res.status(500).json({
        error: 'Something went wrong',
        code: 'UNHANDLED_ERROR',
        details: process.env.DEBUG_MODE === 'true' ? error.message : undefined
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        code: 'NOT_FOUND'
    });
});

// Helper functions
function buildSystemPrompt(context) {
    return `You are an AI assistant for Ansh Sahu's portfolio terminal. 

    Your role is to help users navigate the portfolio and provide helpful information about Ansh's skills, experience, and projects.
    
    Available commands: help, about, projects, skills, experience, contact, education, certifications, leadership, sudo, clear, whoami, ls, pwd, cat, neofetch, status
    
    When a user types something that doesn't match a command exactly:
    1. Try to understand their intent
    2. Suggest the most relevant command
    3. If it's a typo, auto-correct it
    
    Provide helpful, concise responses that guide users to the correct commands or answer their questions about Ansh's portfolio. 
    Keep responses brief and terminal-friendly. Use a professional but approachable tone.`;
}

function getMockResponse(input) {
    const mockResponses = {
        'hep': 'Did you mean "help"? Try typing "help" to see available commands.',
        'abot': 'Did you mean "about"? Try typing "about" to learn more about Mark.',
        'skils': 'Did you mean "skills"? Try typing "skills" to see technical skills.',
        'default': `I'm not sure what "${input}" means. Type "help" to see available commands, or try one of: about, projects, skills, experience, contact.`
    };

    return mockResponses[input.toLowerCase()] || mockResponses.default;
}

function generateSuggestions(input, context) {
    const commands = ['help', 'about', 'projects', 'skills', 'experience', 'contact', 'education', 'certifications', 'leadership'];

    // Simple fuzzy matching
    return commands
        .filter(cmd => cmd.includes(input.toLowerCase()) || input.toLowerCase().includes(cmd.substring(0, 3)))
        .slice(0, 3)
        .map(cmd => ({
            command: cmd,
            confidence: 0.8,
            reason: `Similar to "${input}"`
        }));
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 API Proxy server running on port ${PORT}`);
    console.log(`📡 OpenAI integration: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing API key'}`);
    console.log(`🛡️  Rate limiting: ${process.env.ENABLE_RATE_LIMITING === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`🔍 Debug mode: ${process.env.DEBUG_MODE === 'true' ? '✅ Enabled' : '❌ Disabled'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = app;
