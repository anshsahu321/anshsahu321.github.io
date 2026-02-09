class SmartErrorHandler {
    constructor(config, aiHandler, commandHistory) {
        this.config = config;
        this.aiHandler = aiHandler;
        this.commandHistory = commandHistory;

        // Error categorization patterns
        this.errorCategories = {
            TYPO: /^[a-zA-Z]+$/,
            INVALID_SYNTAX: /[^a-zA-Z0-9\s\-_.]/,
            TOO_SHORT: /^.{1,2}$/,
            TOO_LONG: /^.{50,}$/,
            NUMERIC: /^\d+$/,
            MIXED_CASE: /[A-Z].*[a-z]|[a-z].*[A-Z]/
        };

        // Error recovery strategies
        this.recoveryStrategies = new Map();
        this.initializeRecoveryStrategies();

        // Error learning system
        this.errorLearning = {
            patterns: new Map(),
            corrections: new Map(),
            contextualErrors: new Map()
        };

        this.loadErrorLearningData();
    }

    initializeRecoveryStrategies() {
        this.recoveryStrategies.set('TYPO', this.handleTypoError.bind(this));
        this.recoveryStrategies.set('INVALID_SYNTAX', this.handleSyntaxError.bind(this));
        this.recoveryStrategies.set('TOO_SHORT', this.handleTooShortError.bind(this));
        this.recoveryStrategies.set('TOO_LONG', this.handleTooLongError.bind(this));
        this.recoveryStrategies.set('NUMERIC', this.handleNumericError.bind(this));
        this.recoveryStrategies.set('MIXED_CASE', this.handleMixedCaseError.bind(this));
        this.recoveryStrategies.set('UNKNOWN', this.handleUnknownError.bind(this));
    }

    // Main error handling method
    async handleError(userInput, context = {}) {
        const errorAnalysis = this.analyzeError(userInput, context);
        const recoveryResult = await this.executeRecoveryStrategy(errorAnalysis);

        // Learn from this error for future improvements
        this.learnFromError(userInput, errorAnalysis, recoveryResult);

        return this.formatErrorResponse(errorAnalysis, recoveryResult);
    }

    // Analyze the error to determine category and context
    analyzeError(userInput, context) {
        const analysis = {
            input: userInput,
            categories: [],
            confidence: 0,
            context: context,
            timestamp: Date.now(),
            previousCommands: this.commandHistory.history.slice(-3),
            similarity: this.findMostSimilarCommand(userInput),
            errorType: 'UNKNOWN'
        };

        // Categorize the error
        for (const [category, pattern] of Object.entries(this.errorCategories)) {
            if (pattern.test(userInput)) {
                analysis.categories.push(category);
            }
        }

        // Determine primary error type
        if (analysis.categories.length > 0) {
            analysis.errorType = this.selectPrimaryErrorType(analysis.categories, userInput);
        }

        // Calculate confidence based on pattern matching
        analysis.confidence = this.calculateErrorConfidence(analysis);

        return analysis;
    }

    // Execute appropriate recovery strategy
    async executeRecoveryStrategy(errorAnalysis) {
        const strategy = this.recoveryStrategies.get(errorAnalysis.errorType) ||
                        this.recoveryStrategies.get('UNKNOWN');

        return await strategy(errorAnalysis);
    }

    // Typo error handling
    async handleTypoError(analysis) {
        const { input } = analysis;
        const suggestions = [];

        // Check pre-defined typo corrections
        const quickFix = this.config.TYPO_CORRECTIONS[input.toLowerCase()];
        if (quickFix) {
            suggestions.push({
                type: 'quick_fix',
                suggestion: quickFix,
                confidence: 0.95,
                reason: 'Common typo correction'
            });
        }

        // Fuzzy matching with valid commands
        const fuzzyMatches = this.getFuzzyMatches(input);
        suggestions.push(...fuzzyMatches);

        // AI-powered suggestion
        if (this.config.AI_FEATURES.ENABLED && suggestions.length === 0) {
            const aiSuggestion = await this.getAISuggestion(analysis);
            if (aiSuggestion) {
                suggestions.push(aiSuggestion);
            }
        }

        return {
            strategy: 'TYPO_CORRECTION',
            suggestions: suggestions.slice(0, 3),
            canAutoCorrect: suggestions.length > 0 && suggestions[0].confidence > 0.8,
            recommendedAction: 'Show suggestions with auto-correct option'
        };
    }

    // Syntax error handling
    async handleSyntaxError(analysis) {
        const cleanInput = analysis.input.replace(/[^a-zA-Z0-9\s]/g, '');

        return {
            strategy: 'SYNTAX_CLEANUP',
            suggestions: [{
                type: 'cleaned_input',
                suggestion: cleanInput,
                confidence: 0.7,
                reason: 'Removed invalid characters'
            }],
            canAutoCorrect: true,
            recommendedAction: 'Clean input and retry'
        };
    }

    // Too short input handling
    async handleTooShortError(analysis) {
        const expandedSuggestions = this.config.VALID_COMMANDS
            .filter(cmd => cmd.startsWith(analysis.input.toLowerCase()))
            .map(cmd => ({
                type: 'expansion',
                suggestion: cmd,
                confidence: 0.8,
                reason: 'Command expansion'
            }));

        return {
            strategy: 'EXPAND_COMMAND',
            suggestions: expandedSuggestions,
            canAutoCorrect: expandedSuggestions.length === 1,
            recommendedAction: 'Show command completions'
        };
    }

    // Too long input handling
    async handleTooLongError(analysis) {
        // Try to extract command from long input
        const words = analysis.input.toLowerCase().split(/\s+/);
        const possibleCommands = words.filter(word =>
            this.config.VALID_COMMANDS.includes(word)
        );

        const suggestions = possibleCommands.map(cmd => ({
            type: 'extraction',
            suggestion: cmd,
            confidence: 0.6,
            reason: 'Extracted from long input'
        }));

        return {
            strategy: 'EXTRACT_COMMAND',
            suggestions,
            canAutoCorrect: false,
            recommendedAction: 'Show extracted commands or ask for clarification'
        };
    }

    // Numeric input handling
    async handleNumericError(analysis) {
        const num = parseInt(analysis.input);
        const suggestions = [];

        // Check if it's a history index
        if (num > 0 && num <= this.commandHistory.history.length) {
            const historicCommand = this.commandHistory.history[this.commandHistory.history.length - num];
            suggestions.push({
                type: 'history_reference',
                suggestion: historicCommand.command,
                confidence: 0.9,
                reason: `History command #${num}`
            });
        }

        // Check if it could be a shortcut
        const shortcuts = ['1', '2', '3', '4', '5'];
        if (shortcuts.includes(analysis.input)) {
            const shortcutCommands = ['help', 'about', 'projects', 'skills', 'contact'];
            suggestions.push({
                type: 'shortcut',
                suggestion: shortcutCommands[num - 1],
                confidence: 0.7,
                reason: 'Numeric shortcut'
            });
        }

        return {
            strategy: 'NUMERIC_INTERPRETATION',
            suggestions,
            canAutoCorrect: suggestions.length > 0,
            recommendedAction: 'Interpret numeric input or show help'
        };
    }

    // Mixed case handling
    async handleMixedCaseError(analysis) {
        const lowercaseInput = analysis.input.toLowerCase();

        return {
            strategy: 'CASE_NORMALIZATION',
            suggestions: [{
                type: 'case_fix',
                suggestion: lowercaseInput,
                confidence: 0.9,
                reason: 'Commands are case-insensitive'
            }],
            canAutoCorrect: true,
            recommendedAction: 'Auto-correct to lowercase'
        };
    }

    // Unknown error handling
    async handleUnknownError(analysis) {
        const suggestions = [];

        // Try contextual suggestions
        const contextual = this.getContextualSuggestions(analysis);
        suggestions.push(...contextual);

        // Get popular commands
        const popular = this.commandHistory.getMostUsedCommands(3)
            .map(cmd => ({
                type: 'popular',
                suggestion: cmd.command,
                confidence: 0.4,
                reason: 'Popular command'
            }));
        suggestions.push(...popular);

        // AI fallback
        if (this.config.AI_FEATURES.ENABLED) {
            const aiSuggestion = await this.getAISuggestion(analysis);
            if (aiSuggestion) {
                suggestions.push(aiSuggestion);
            }
        }

        return {
            strategy: 'GENERAL_ASSISTANCE',
            suggestions: suggestions.slice(0, 5),
            canAutoCorrect: false,
            recommendedAction: 'Show help and suggestions'
        };
    }

    // Get AI-powered suggestion
    async getAISuggestion(analysis) {
        try {
            const context = {
                errorType: analysis.errorType,
                input: analysis.input,
                previousCommands: analysis.previousCommands,
                availableCommands: this.config.VALID_COMMANDS
            };

            const aiResponse = await this.aiHandler.processCommand(analysis.input, context);

            if (aiResponse && aiResponse.type === 'suggestion') {
                return {
                    type: 'ai_powered',
                    suggestion: aiResponse.suggestion,
                    confidence: 0.8,
                    reason: 'AI analysis'
                };
            }
        } catch (error) {
            console.warn('AI suggestion failed:', error);
        }

        return null;
    }

    // Find most similar command using advanced matching
    findMostSimilarCommand(input) {
        let bestMatch = null;
        let bestScore = 0;

        for (const command of this.config.VALID_COMMANDS) {
            const score = this.calculateSimilarityScore(input.toLowerCase(), command);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = command;
            }
        }

        return bestMatch && bestScore > 0.5 ? {
            command: bestMatch,
            score: bestScore
        } : null;
    }

    // Calculate advanced similarity score
    calculateSimilarityScore(input, command) {
        // Multiple similarity metrics
        const metrics = [
            this.levenshteinSimilarity(input, command),
            this.jaccardSimilarity(input, command),
            this.longestCommonSubsequence(input, command),
            this.soundexSimilarity(input, command)
        ];

        // Weighted average
        const weights = [0.4, 0.3, 0.2, 0.1];
        return metrics.reduce((sum, metric, index) =>
            sum + (metric * weights[index]), 0);
    }

    // Levenshtein distance similarity
    levenshteinSimilarity(str1, str2) {
        const matrix = [];
        const len1 = str1.length;
        const len2 = str2.length;

        // Create matrix
        for (let i = 0; i <= len2; i++) matrix[i] = [i];
        for (let j = 0; j <= len1; j++) matrix[0][j] = j;

        // Fill matrix
        for (let i = 1; i <= len2; i++) {
            for (let j = 1; j <= len1; j++) {
                const cost = str1[j - 1] === str2[i - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }

        const distance = matrix[len2][len1];
        const maxLen = Math.max(len1, len2);
        return maxLen === 0 ? 1 : (maxLen - distance) / maxLen;
    }

    // Jaccard similarity for set-based comparison
    jaccardSimilarity(str1, str2) {
        const set1 = new Set(str1.toLowerCase().split(''));
        const set2 = new Set(str2.toLowerCase().split(''));

        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);

        return intersection.size / union.size;
    }

    // Longest common subsequence similarity
    longestCommonSubsequence(str1, str2) {
        const matrix = Array(str1.length + 1).fill().map(() =>
            Array(str2.length + 1).fill(0));

        for (let i = 1; i <= str1.length; i++) {
            for (let j = 1; j <= str2.length; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1] + 1;
                } else {
                    matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
                }
            }
        }

        const lcs = matrix[str1.length][str2.length];
        return lcs / Math.max(str1.length, str2.length);
    }

    // Simple Soundex similarity
    soundexSimilarity(str1, str2) {
        const soundex1 = this.soundex(str1);
        const soundex2 = this.soundex(str2);
        return soundex1 === soundex2 ? 1 : 0;
    }

    soundex(str) {
        const a = str.toLowerCase().split('');
        const f = a.shift();
        let r = '';
        const codes = {
            a: '', e: '', i: '', o: '', u: '', h: '', w: '', y: '',
            b: 1, f: 1, p: 1, v: 1,
            c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
            d: 3, t: 3,
            l: 4,
            m: 5, n: 5,
            r: 6
        };

        r = f + a
            .map(v => codes[v])
            .filter((v, i, arr) => i === 0 ? v !== codes[f] : v !== arr[i - 1])
            .join('');

        return (r + '000').slice(0, 4).toUpperCase();
    }

    // Format final error response
    formatErrorResponse(analysis, recovery) {
        const response = {
            error: true,
            input: analysis.input,
            errorType: analysis.errorType,
            strategy: recovery.strategy,
            suggestions: recovery.suggestions,
            canAutoCorrect: recovery.canAutoCorrect,
            confidence: analysis.confidence,
            message: this.generateErrorMessage(analysis, recovery),
            timestamp: Date.now(),
            learningData: this.extractLearningData(analysis, recovery)
        };

        return response;
    }

    // Generate user-friendly error message
    generateErrorMessage(analysis, recovery) {
        const templates = {
            TYPO: "I think there might be a typo. Did you mean:",
            SYNTAX_CLEANUP: "I found some invalid characters. Try:",
            EXPAND_COMMAND: "That looks like a partial command. Maybe:",
            EXTRACT_COMMAND: "That's quite long! I found these commands:",
            NUMERIC_INTERPRETATION: "I'm not sure what that number means. Perhaps:",
            CASE_NORMALIZATION: "Commands are case-insensitive. I'll use:",
            GENERAL_ASSISTANCE: "I couldn't recognize that command. Here are some options:"
        };

        let message = templates[recovery.strategy] || "I couldn't understand that command.";

        if (recovery.suggestions.length > 0) {
            const topSuggestion = recovery.suggestions[0];
            if (recovery.canAutoCorrect) {
                message += ` "${topSuggestion.suggestion}"?`;
            } else {
                message += "\n" + recovery.suggestions
                    .slice(0, 3)
                    .map(s => `• ${s.suggestion} (${s.reason})`)
                    .join("\n");
            }
        }

        return message;
    }

    // Learn from error for future improvements
    learnFromError(input, analysis, recovery) {
        const learningKey = input.toLowerCase();
        const learningData = this.errorLearning.patterns.get(learningKey) || {
            count: 0,
            strategies: new Map(),
            successfulSuggestions: [],
            contexts: []
        };

        learningData.count++;
        learningData.strategies.set(recovery.strategy,
            (learningData.strategies.get(recovery.strategy) || 0) + 1);
        learningData.contexts.push(analysis.context);

        this.errorLearning.patterns.set(learningKey, learningData);

        // Save learning data periodically
        if (learningData.count % 10 === 0) {
            this.saveErrorLearningData();
        }
    }

    // Helper methods for getting suggestions
    getFuzzyMatches(input) {
        return this.config.VALID_COMMANDS
            .map(cmd => ({
                command: cmd,
                score: this.calculateSimilarityScore(input.toLowerCase(), cmd)
            }))
            .filter(match => match.score > 0.5)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(match => ({
                type: 'fuzzy_match',
                suggestion: match.command,
                confidence: match.score,
                reason: 'Similar spelling'
            }));
    }

    getContextualSuggestions(analysis) {
        if (analysis.previousCommands.length === 0) return [];

        const lastCommand = analysis.previousCommands[analysis.previousCommands.length - 1]?.command;
        if (!lastCommand) return [];

        // Get commands that often follow the last command
        const contextualCommands = this.commandHistory.getContextualSuggestions(lastCommand);

        return contextualCommands.map(cmd => ({
            type: 'contextual',
            suggestion: cmd.command,
            confidence: 0.6,
            reason: `Often follows "${lastCommand}"`
        }));
    }

    // Persistence methods
    saveErrorLearningData() {
        try {
            const data = {
                patterns: Array.from(this.errorLearning.patterns.entries()),
                corrections: Array.from(this.errorLearning.corrections.entries()),
                contextualErrors: Array.from(this.errorLearning.contextualErrors.entries()),
                lastSaved: Date.now()
            };

            localStorage.setItem('portfolio_error_learning', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save error learning data:', error);
        }
    }

    loadErrorLearningData() {
        try {
            const saved = localStorage.getItem('portfolio_error_learning');
            if (saved) {
                const data = JSON.parse(saved);
                this.errorLearning.patterns = new Map(data.patterns || []);
                this.errorLearning.corrections = new Map(data.corrections || []);
                this.errorLearning.contextualErrors = new Map(data.contextualErrors || []);
            }
        } catch (error) {
            console.warn('Failed to load error learning data:', error);
        }
    }

    // Utility methods
    selectPrimaryErrorType(categories, input) {
        if (categories.includes('TYPO') && input.length > 2) return 'TYPO';
        if (categories.includes('TOO_SHORT')) return 'TOO_SHORT';
        if (categories.includes('TOO_LONG')) return 'TOO_LONG';
        if (categories.includes('NUMERIC')) return 'NUMERIC';
        if (categories.includes('INVALID_SYNTAX')) return 'INVALID_SYNTAX';
        if (categories.includes('MIXED_CASE')) return 'MIXED_CASE';
        return 'UNKNOWN';
    }

    calculateErrorConfidence(analysis) {
        let confidence = 0.5; // Base confidence

        if (analysis.categories.length > 0) confidence += 0.2;
        if (analysis.similarity) confidence += analysis.similarity.score * 0.3;

        return Math.min(1.0, confidence);
    }

    extractLearningData(analysis, recovery) {
        return {
            errorCategory: analysis.errorType,
            inputLength: analysis.input.length,
            suggestionsCount: recovery.suggestions.length,
            hasAutoCorrect: recovery.canAutoCorrect,
            strategyUsed: recovery.strategy
        };
    }
}

// Export for use in other files
window.SmartErrorHandler = SmartErrorHandler;
