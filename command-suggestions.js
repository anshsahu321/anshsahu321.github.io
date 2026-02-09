class CommandSuggestionEngine {
    constructor(config) {
        this.config = config;
        this.commandHistory = [];
        this.userPreferences = new Map();
        this.contextualSuggestions = new Map();
        this.initializeContextualMappings();
    }

    initializeContextualMappings() {
        // Map related commands for contextual suggestions
        this.contextualSuggestions.set('about', ['skills', 'experience', 'contact']);
        this.contextualSuggestions.set('skills', ['experience', 'projects', 'certifications']);
        this.contextualSuggestions.set('projects', ['skills', 'experience', 'about']);
        this.contextualSuggestions.set('experience', ['skills', 'projects', 'education']);
        this.contextualSuggestions.set('contact', ['about', 'experience']);
        this.contextualSuggestions.set('education', ['certifications', 'skills', 'experience']);
        this.contextualSuggestions.set('certifications', ['education', 'skills']);
        this.contextualSuggestions.set('leadership', ['experience', 'about']);
    }

    // Main suggestion method
    getSuggestions(input, context = {}) {
        const suggestions = [];

        // Add typo corrections
        const typoCorrection = this.getTypoCorrection(input);
        if (typoCorrection) {
            suggestions.push(typoCorrection);
        }

        // Add fuzzy matches
        const fuzzyMatches = this.getFuzzyMatches(input);
        suggestions.push(...fuzzyMatches);

        // Add contextual suggestions
        if (context.lastCommand) {
            const contextual = this.getContextualSuggestions(context.lastCommand);
            suggestions.push(...contextual);
        }

        // Add popular commands based on history
        const popular = this.getPopularCommands(3);
        suggestions.push(...popular);

        // Remove duplicates and return top suggestions
        return this.deduplicateAndRank(suggestions).slice(0, 5);
    }

    getTypoCorrection(input) {
        const correction = this.config.TYPO_CORRECTIONS[input.toLowerCase()];
        if (correction) {
            return {
                type: 'typo',
                command: correction,
                confidence: 0.9,
                reason: `Correcting typo: "${input}" → "${correction}"`
            };
        }
        return null;
    }

    getFuzzyMatches(input) {
        const matches = [];
        const inputLower = input.toLowerCase();

        for (const command of this.config.VALID_COMMANDS) {
            const similarity = this.calculateFuzzyScore(inputLower, command);
            if (similarity >= this.config.SIMILARITY_THRESHOLD) {
                matches.push({
                    type: 'fuzzy',
                    command: command,
                    confidence: similarity,
                    reason: `Similar to "${input}"`
                });
            }
        }

        return matches.sort((a, b) => b.confidence - a.confidence);
    }

    calculateFuzzyScore(input, command) {
        // Multiple fuzzy matching techniques
        const scores = [];

        // Levenshtein distance score
        scores.push(this.levenshteinSimilarity(input, command));

        // Substring match score
        scores.push(this.substringScore(input, command));

        // Character frequency score
        scores.push(this.characterFrequencyScore(input, command));

        // Phonetic similarity (simple)
        scores.push(this.phoneticSimilarity(input, command));

        // Return weighted average
        return scores.reduce((sum, score, index) => {
            const weights = [0.4, 0.3, 0.2, 0.1]; // Weights for different methods
            return sum + (score * weights[index]);
        }, 0);
    }

    levenshteinSimilarity(str1, str2) {
        const matrix = [];
        const len1 = str1.length;
        const len2 = str2.length;

        for (let i = 0; i <= len2; i++) matrix[i] = [i];
        for (let j = 0; j <= len1; j++) matrix[0][j] = j;

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

    substringScore(input, command) {
        if (command.includes(input)) return 0.8;
        if (input.includes(command)) return 0.6;

        // Check for partial matches
        let matches = 0;
        const inputChars = input.split('');
        const commandChars = command.split('');

        for (const char of inputChars) {
            if (commandChars.includes(char)) matches++;
        }

        return matches / Math.max(inputChars.length, commandChars.length);
    }

    characterFrequencyScore(input, command) {
        const inputFreq = this.getCharFrequency(input);
        const commandFreq = this.getCharFrequency(command);

        const allChars = new Set([...Object.keys(inputFreq), ...Object.keys(commandFreq)]);
        let similarity = 0;

        for (const char of allChars) {
            const freq1 = inputFreq[char] || 0;
            const freq2 = commandFreq[char] || 0;
            similarity += Math.min(freq1, freq2);
        }

        return similarity / Math.max(input.length, command.length);
    }

    phoneticSimilarity(input, command) {
        // Simple phonetic similarity (first letter + vowels)
        const getPhonetic = str => {
            const consonants = str.replace(/[aeiou]/gi, '');
            const vowels = str.match(/[aeiou]/gi) || [];
            return consonants[0] + vowels.join('');
        };

        const inputPhonetic = getPhonetic(input);
        const commandPhonetic = getPhonetic(command);

        return inputPhonetic === commandPhonetic ? 1 : 0;
    }

    getCharFrequency(str) {
        const freq = {};
        for (const char of str.toLowerCase()) {
            freq[char] = (freq[char] || 0) + 1;
        }
        return freq;
    }

    getContextualSuggestions(lastCommand) {
        const related = this.contextualSuggestions.get(lastCommand) || [];
        return related.map(command => ({
            type: 'contextual',
            command: command,
            confidence: 0.7,
            reason: `Related to "${lastCommand}"`
        }));
    }

    getPopularCommands(count) {
        const frequency = new Map();

        for (const cmd of this.commandHistory) {
            frequency.set(cmd, (frequency.get(cmd) || 0) + 1);
        }

        return Array.from(frequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, count)
            .map(([command]) => ({
                type: 'popular',
                command: command,
                confidence: 0.5,
                reason: 'Frequently used'
            }));
    }

    deduplicateAndRank(suggestions) {
        const seen = new Set();
        const unique = suggestions.filter(suggestion => {
            if (seen.has(suggestion.command)) return false;
            seen.add(suggestion.command);
            return true;
        });

        return unique.sort((a, b) => {
            // Sort by confidence, then by type priority
            if (a.confidence !== b.confidence) {
                return b.confidence - a.confidence;
            }

            const typePriority = { typo: 4, fuzzy: 3, contextual: 2, popular: 1 };
            return (typePriority[b.type] || 0) - (typePriority[a.type] || 0);
        });
    }

    // Track command usage for learning
    recordCommand(command) {
        this.commandHistory.push(command);

        // Keep history size manageable
        if (this.commandHistory.length > 100) {
            this.commandHistory.shift();
        }

        // Update user preferences
        const current = this.userPreferences.get(command) || 0;
        this.userPreferences.set(command, current + 1);
    }

    // Generate help text with suggestions
    generateHelpWithSuggestions(input) {
        const suggestions = this.getSuggestions(input);

        if (suggestions.length === 0) {
            return "No suggestions available. Type 'help' to see all commands.";
        }

        let helpText = `Did you mean one of these?\n\n`;

        for (const suggestion of suggestions) {
            helpText += `  • <span class="correction-suggestion">${suggestion.command}</span> - ${suggestion.reason}\n`;
        }

        helpText += `\nType 'help' to see all available commands.`;

        return helpText;
    }
}

// Export for use in other files
window.CommandSuggestionEngine = CommandSuggestionEngine;
