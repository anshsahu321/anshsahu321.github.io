class AdvancedCommandHistory {
    constructor(config) {
        this.config = config;
        this.history = [];
        this.sessionHistory = [];
        this.userPatterns = new Map();
        this.commandFrequency = new Map();
        this.contextualChains = new Map();
        this.errorPatterns = new Map();
        this.maxHistorySize = 1000;
        this.sessionStartTime = Date.now();

        // Load persisted history
        this.loadHistoryFromStorage();

        // AI learning parameters
        this.learningEnabled = true;
        this.patternConfidenceThreshold = 0.7;
        this.contextWindowSize = 3;
    }

    // Record a command with full context
    recordCommand(command, context = {}) {
        const timestamp = Date.now();
        const historyEntry = {
            command: command.trim().toLowerCase(),
            originalInput: context.originalInput || command,
            timestamp,
            sessionTime: timestamp - this.sessionStartTime,
            success: context.success !== false,
            executionTime: context.executionTime || 0,
            corrected: context.corrected || false,
            aiAssisted: context.aiAssisted || false,
            context: {
                previousCommand: this.getLastCommand(),
                userAgent: navigator.userAgent,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`,
                timeOfDay: new Date().getHours()
            }
        };

        // Add to histories
        this.history.push(historyEntry);
        this.sessionHistory.push(historyEntry);

        // Maintain size limits
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }

        // Update learning data
        this.updateLearningData(historyEntry);

        // Persist to storage
        this.saveHistoryToStorage();

        return historyEntry;
    }

    // Update AI learning data based on command patterns
    updateLearningData(entry) {
        const { command, context, success, corrected } = entry;

        // Update command frequency
        const currentFreq = this.commandFrequency.get(command) || 0;
        this.commandFrequency.set(command, currentFreq + 1);

        // Update contextual command chains
        if (context.previousCommand) {
            const chainKey = `${context.previousCommand}->${command}`;
            const chainFreq = this.contextualChains.get(chainKey) || 0;
            this.contextualChains.set(chainKey, chainFreq + 1);
        }

        // Track error patterns for failed commands
        if (!success) {
            const errorKey = entry.originalInput;
            const errorData = this.errorPatterns.get(errorKey) || {
                count: 0,
                corrections: [],
                contexts: []
            };

            errorData.count++;
            if (corrected) {
                errorData.corrections.push(command);
            }
            errorData.contexts.push(context);

            this.errorPatterns.set(errorKey, errorData);
        }

        // Update user behavioral patterns
        this.updateUserPatterns(entry);
    }

    // Analyze user behavior patterns
    updateUserPatterns(entry) {
        const timeOfDay = entry.context.timeOfDay;
        const hourKey = `hour_${timeOfDay}`;

        const hourData = this.userPatterns.get(hourKey) || {
            commands: new Map(),
            avgExecutionTime: 0,
            errorRate: 0,
            totalCommands: 0
        };

        // Update hourly command patterns
        const cmdCount = hourData.commands.get(entry.command) || 0;
        hourData.commands.set(entry.command, cmdCount + 1);
        hourData.totalCommands++;

        // Update execution time average
        hourData.avgExecutionTime = (
            (hourData.avgExecutionTime * (hourData.totalCommands - 1)) +
            entry.executionTime
        ) / hourData.totalCommands;

        this.userPatterns.set(hourKey, hourData);
    }

    // Get intelligent command suggestions based on history
    getIntelligentSuggestions(currentInput = '', limit = 5) {
        const suggestions = [];

        // 1. Exact match suggestions from history
        const exactMatches = this.getExactMatches(currentInput);
        suggestions.push(...exactMatches);

        // 2. Contextual suggestions based on previous commands
        const contextual = this.getContextualSuggestions();
        suggestions.push(...contextual);

        // 3. Frequency-based popular commands
        const popular = this.getPopularCommands();
        suggestions.push(...popular);

        // 4. Time-based patterns
        const timeBased = this.getTimeBasedSuggestions();
        suggestions.push(...timeBased);

        // 5. Error correction learning
        const errorLearning = this.getErrorCorrectionSuggestions(currentInput);
        suggestions.push(...errorLearning);

        return this.rankAndDeduplicate(suggestions).slice(0, limit);
    }

    // Get exact matches from command history
    getExactMatches(input) {
        if (!input) return [];

        const inputLower = input.toLowerCase();
        const matches = new Set();

        for (const entry of this.history.slice(-50)) { // Last 50 commands
            if (entry.command.startsWith(inputLower) && entry.success) {
                matches.add(entry.command);
            }
        }

        return Array.from(matches).map(cmd => ({
            command: cmd,
            type: 'exact',
            confidence: 0.9,
            reason: 'Previously used command',
            frequency: this.commandFrequency.get(cmd) || 1
        }));
    }

    // Get contextual suggestions based on command chains
    getContextualSuggestions() {
        const lastCommand = this.getLastCommand();
        if (!lastCommand) return [];

        const suggestions = [];

        for (const [chain, frequency] of this.contextualChains.entries()) {
            if (chain.startsWith(lastCommand + '->')) {
                const nextCommand = chain.split('->')[1];
                suggestions.push({
                    command: nextCommand,
                    type: 'contextual',
                    confidence: Math.min(0.8, frequency / 10),
                    reason: `Often follows "${lastCommand}"`,
                    frequency
                });
            }
        }

        return suggestions.sort((a, b) => b.frequency - a.frequency).slice(0, 3);
    }

    // Get popular commands based on usage frequency
    getPopularCommands() {
        return Array.from(this.commandFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([command, frequency]) => ({
                command,
                type: 'popular',
                confidence: 0.6,
                reason: `Used ${frequency} times`,
                frequency
            }));
    }

    // Get time-based suggestions
    getTimeBasedSuggestions() {
        const currentHour = new Date().getHours();
        const hourKey = `hour_${currentHour}`;
        const hourData = this.userPatterns.get(hourKey);

        if (!hourData) return [];

        return Array.from(hourData.commands.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([command, count]) => ({
                command,
                type: 'time-based',
                confidence: 0.5,
                reason: `Commonly used at ${currentHour}:00`,
                frequency: count
            }));
    }

    // Get suggestions based on error correction patterns
    getErrorCorrectionSuggestions(input) {
        if (!input) return [];

        const suggestions = [];

        for (const [errorInput, errorData] of this.errorPatterns.entries()) {
            if (this.isInputSimilar(input, errorInput)) {
                const mostCommonCorrection = this.getMostFrequentCorrection(errorData.corrections);
                if (mostCommonCorrection) {
                    suggestions.push({
                        command: mostCommonCorrection,
                        type: 'error-learning',
                        confidence: 0.85,
                        reason: `Learned correction for similar input`,
                        frequency: errorData.count
                    });
                }
            }
        }

        return suggestions;
    }

    // Smart history navigation with AI insights
    getSmartHistoryNavigation(direction, currentInput = '') {
        const relevantHistory = this.getRelevantHistory(currentInput);

        if (direction === 'up') {
            return this.getNextRelevantCommand(relevantHistory, 1);
        } else if (direction === 'down') {
            return this.getNextRelevantCommand(relevantHistory, -1);
        }

        return null;
    }

    // Get command history with AI-powered filtering
    getRelevantHistory(filter = '') {
        let relevantCommands = this.history.filter(entry => entry.success);

        if (filter) {
            const filterLower = filter.toLowerCase();
            relevantCommands = relevantCommands.filter(entry =>
                entry.command.includes(filterLower) ||
                entry.originalInput.toLowerCase().includes(filterLower)
            );
        }

        // Sort by relevance score
        return relevantCommands.map(entry => ({
            ...entry,
            relevanceScore: this.calculateRelevanceScore(entry, filter)
        })).sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // Calculate relevance score for history entries
    calculateRelevanceScore(entry, filter) {
        let score = 0;

        // Recency factor (more recent = higher score)
        const age = Date.now() - entry.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        score += Math.max(0, 1 - age / maxAge) * 0.3;

        // Frequency factor
        const frequency = this.commandFrequency.get(entry.command) || 1;
        score += Math.log(frequency) * 0.2;

        // Success factor
        if (entry.success) score += 0.2;

        // AI assistance factor (prefer commands that worked well with AI)
        if (entry.aiAssisted && entry.success) score += 0.1;

        // Filter relevance
        if (filter && entry.command.includes(filter.toLowerCase())) {
            score += 0.2;
        }

        return score;
    }

    // Generate learning insights for the user
    generateLearningInsights() {
        const insights = {
            totalCommands: this.history.length,
            sessionCommands: this.sessionHistory.length,
            mostUsedCommands: this.getMostUsedCommands(5),
            commandChains: this.getMostCommonChains(3),
            errorPatterns: this.getCommonErrors(3),
            usagePatterns: this.getUsagePatterns(),
            suggestions: this.getPersonalizedSuggestions()
        };

        return insights;
    }

    // Helper methods
    getLastCommand() {
        return this.history.length > 0 ?
            this.history[this.history.length - 1].command : null;
    }

    getMostUsedCommands(limit) {
        return Array.from(this.commandFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([cmd, count]) => ({ command: cmd, count }));
    }

    getMostCommonChains(limit) {
        return Array.from(this.contextualChains.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([chain, count]) => ({ chain, count }));
    }

    getCommonErrors(limit) {
        return Array.from(this.errorPatterns.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, limit)
            .map(([error, data]) => ({ error, count: data.count }));
    }

    isInputSimilar(input1, input2, threshold = 0.6) {
        // Simple similarity check
        const len1 = input1.length;
        const len2 = input2.length;
        const maxLen = Math.max(len1, len2);

        if (maxLen === 0) return true;

        let matches = 0;
        for (let i = 0; i < Math.min(len1, len2); i++) {
            if (input1[i].toLowerCase() === input2[i].toLowerCase()) {
                matches++;
            }
        }

        return matches / maxLen >= threshold;
    }

    getMostFrequentCorrection(corrections) {
        if (corrections.length === 0) return null;

        const freq = new Map();
        for (const correction of corrections) {
            freq.set(correction, (freq.get(correction) || 0) + 1);
        }

        return Array.from(freq.entries())
            .sort((a, b) => b[1] - a[1])[0][0];
    }

    rankAndDeduplicate(suggestions) {
        const seen = new Set();
        return suggestions
            .filter(suggestion => {
                if (seen.has(suggestion.command)) return false;
                seen.add(suggestion.command);
                return true;
            })
            .sort((a, b) => {
                // Sort by confidence, then frequency
                if (a.confidence !== b.confidence) {
                    return b.confidence - a.confidence;
                }
                return (b.frequency || 0) - (a.frequency || 0);
            });
    }

    // Persistence methods
    saveHistoryToStorage() {
        try {
            const historyData = {
                history: this.history.slice(-100), // Keep last 100 commands
                commandFrequency: Array.from(this.commandFrequency.entries()),
                contextualChains: Array.from(this.contextualChains.entries()),
                userPatterns: Array.from(this.userPatterns.entries()),
                lastSaved: Date.now()
            };

            localStorage.setItem('portfolio_command_history', JSON.stringify(historyData));
        } catch (error) {
            console.warn('Failed to save command history:', error);
        }
    }

    loadHistoryFromStorage() {
        try {
            const saved = localStorage.getItem('portfolio_command_history');
            if (saved) {
                const data = JSON.parse(saved);

                this.history = data.history || [];
                this.commandFrequency = new Map(data.commandFrequency || []);
                this.contextualChains = new Map(data.contextualChains || []);
                this.userPatterns = new Map(data.userPatterns || []);
            }
        } catch (error) {
            console.warn('Failed to load command history:', error);
        }
    }

    // Clear history
    clearHistory(keepStats = false) {
        this.history = [];
        this.sessionHistory = [];

        if (!keepStats) {
            this.commandFrequency.clear();
            this.contextualChains.clear();
            this.userPatterns.clear();
            this.errorPatterns.clear();
        }

        this.saveHistoryToStorage();
    }

    // Export history for analysis
    exportHistory() {
        return {
            history: this.history,
            sessionHistory: this.sessionHistory,
            statistics: {
                commandFrequency: Array.from(this.commandFrequency.entries()),
                contextualChains: Array.from(this.contextualChains.entries()),
                userPatterns: Array.from(this.userPatterns.entries()),
                errorPatterns: Array.from(this.errorPatterns.entries())
            },
            insights: this.generateLearningInsights()
        };
    }
}

// Export for use in other files
window.AdvancedCommandHistory = AdvancedCommandHistory;
