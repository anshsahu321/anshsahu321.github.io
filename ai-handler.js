class AIHandler {
    constructor(config) {
        this.config = config;
        this.isProcessing = false;
        this.requestQueue = [];
        this.rateLimitDelay = 1000; // 1 second between requests
        this.lastRequestTime = 0;
    }

    // Main AI processing function
    async processCommand(userInput, context = {}) {
        if (!this.config.AI_FEATURES.ENABLED) {
            return this.fallbackResponse(userInput);
        }

        this.isProcessing = true;
        this.updateAIStatus('working');

        try {
            // Check for simple typo corrections first
            const correctedCommand = this.checkTypoCorrection(userInput);
            if (correctedCommand !== userInput) {
                return this.createCorrectionResponse(userInput, correctedCommand);
            }

            // Check command similarity
            const similarCommand = this.findSimilarCommand(userInput);
            if (similarCommand) {
                return this.createSuggestionResponse(userInput, similarCommand);
            }

            // If no simple correction, use AI API
            if (this.shouldUseAI(userInput)) {
                return await this.getAIResponse(userInput, context);
            }

            // Fallback to standard error
            return this.createNotFoundResponse(userInput);

        } catch (error) {
            console.error('AI processing error:', error);
            return this.createErrorResponse(userInput);
        } finally {
            this.isProcessing = false;
            this.updateAIStatus('ready');
        }
    }

    // Simple typo correction using predefined mappings
    checkTypoCorrection(input) {
        const lowercaseInput = input.toLowerCase().trim();
        return this.config.TYPO_CORRECTIONS[lowercaseInput] || input;
    }

    // Find similar commands using string similarity
    findSimilarCommand(input) {
        const inputLower = input.toLowerCase();
        const validCommands = this.config.VALID_COMMANDS;

        let bestMatch = null;
        let bestScore = 0;

        for (const command of validCommands) {
            const score = this.calculateSimilarity(inputLower, command);
            if (score > bestScore && score >= this.config.SIMILARITY_THRESHOLD) {
                bestScore = score;
                bestMatch = command;
            }
        }

        return bestMatch;
    }

    // Calculate string similarity (Levenshtein distance based)
    calculateSimilarity(str1, str2) {
        const matrix = [];
        const len1 = str1.length;
        const len2 = str2.length;

        // Create matrix
        for (let i = 0; i <= len2; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= len1; j++) {
            matrix[0][j] = j;
        }

        // Fill matrix
        for (let i = 1; i <= len2; i++) {
            for (let j = 1; j <= len1; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        const distance = matrix[len2][len1];
        const maxLen = Math.max(len1, len2);
        return maxLen === 0 ? 1 : (maxLen - distance) / maxLen;
    }

    // OpenAI API integration
    async getAIResponse(userInput, context) {
        // Implement rate limiting
        const now = Date.now();
        if (now - this.lastRequestTime < this.rateLimitDelay) {
            await this.sleep(this.rateLimitDelay - (now - this.lastRequestTime));
        }
        this.lastRequestTime = Date.now();

        const prompt = this.buildPrompt(userInput, context);

        try {
            // Note: This should be proxied through your backend in production
            const response = await fetch(this.config.OPENAI.API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: userInput,
                    prompt: prompt,
                    context: context
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            return this.createAIResponse(data.response, userInput);

        } catch (error) {
            console.error('OpenAI API error:', error);
            return this.createErrorResponse(userInput);
        }
    }

    // Build context-aware prompt for AI
    buildPrompt(userInput, context) {
        const systemPrompt = `You are an AI assistant for Ansh Sahu's portfolio terminal. 
        Help users navigate and understand Ansh's professional profile, skills, and experience.
        The user typed "${userInput}" which doesn't match any available commands.
        
        Available commands: ${this.config.VALID_COMMANDS.join(', ')}
        
        Context: This is a terminal-style portfolio website for a Software & AI Engineer.
        
        Please provide a helpful response that either:
        1. Suggests the most likely intended command
        2. Provides relevant information if the user seems to be asking a question
        3. Guides them back to valid commands
        
        Keep the response brief, terminal-friendly, and helpful. Use a friendly but professional tone.`;

        return systemPrompt;
    }

    // Response creators
    createCorrectionResponse(original, corrected) {
        return {
            type: 'correction',
            original: original,
            corrected: corrected,
            message: `${this.config.RESPONSE_TEMPLATES.CORRECTING_TYPO}: "${original}" → "${corrected}"`
        };
    }

    createSuggestionResponse(original, suggestion) {
        return {
            type: 'suggestion',
            original: original,
            suggestion: suggestion,
            message: `${this.config.RESPONSE_TEMPLATES.COMMAND_NOT_FOUND}: "${suggestion}"?`
        };
    }

    createAIResponse(response, original) {
        return {
            type: 'ai',
            original: original,
            response: response,
            message: response
        };
    }

    createNotFoundResponse(original) {
        return {
            type: 'error',
            original: original,
            message: `Command "${original}" not found. Type 'help' to see available commands.`
        };
    }

    createErrorResponse(original) {
        return {
            type: 'error',
            original: original,
            message: `${this.config.RESPONSE_TEMPLATES.AI_ERROR} Type 'help' for available commands.`
        };
    }

    fallbackResponse(userInput) {
        const corrected = this.checkTypoCorrection(userInput);
        if (corrected !== userInput) {
            return this.createCorrectionResponse(userInput, corrected);
        }

        const similar = this.findSimilarCommand(userInput);
        if (similar) {
            return this.createSuggestionResponse(userInput, similar);
        }

        return this.createNotFoundResponse(userInput);
    }

    // Utility methods
    shouldUseAI(input) {
        // Use AI for complex queries or when simple corrections fail
        return input.length > 3 && !this.config.VALID_COMMANDS.includes(input.toLowerCase());
    }

    updateAIStatus(status) {
        const statusElement = document.getElementById('ai-status');
        if (statusElement) {
            statusElement.className = `status-item ai-${status}`;
            switch (status) {
                case 'working':
                    statusElement.textContent = '🤖 AI Thinking...';
                    break;
                case 'error':
                    statusElement.textContent = '🤖 AI Error';
                    break;
                case 'ready':
                default:
                    statusElement.textContent = '🤖 AI Ready';
            }
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other files
window.AIHandler = AIHandler;
