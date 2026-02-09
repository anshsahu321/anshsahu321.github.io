class ResponseTemplateEngine {
    constructor(config) {
        this.config = config;
        this.templates = new Map();
        this.dynamicVariables = new Map();
        this.contextualModifiers = new Map();
        this.personalization = {
            userName: 'User',
            preferredStyle: 'professional',
            experienceLevel: 'intermediate',
            visitCount: this.getVisitCount()
        };

        this.initializeTemplates();
        this.initializeContextualModifiers();
        this.loadPersonalizationData();
    }

    initializeTemplates() {
        // Command response templates
        this.templates.set('help', {
            standard: `
                <h3>🚀 Portfolio Terminal Commands</h3>
                <div class="command-grid">
                    <div class="command-category">
                        <h4>📋 Information Commands</h4>
                        <ul>
                            <li><span class="cmd">about</span> - Learn about Mark's background</li>
                            <li><span class="cmd">skills</span> - View technical expertise</li>
                            <li><span class="cmd">experience</span> - Professional journey</li>
                            <li><span class="cmd">education</span> - Academic background</li>
                            <li><span class="cmd">certifications</span> - Professional credentials</li>
                        </ul>
                    </div>
                    <div class="command-category">
                        <h4>💼 Portfolio Commands</h4>
                        <ul>
                            <li><span class="cmd">projects</span> - Featured work & achievements</li>
                            <li><span class="cmd">leadership</span> - Leadership experience</li>
                            <li><span class="cmd">contact</span> - Get in touch</li>
                        </ul>
                    </div>
                    <div class="command-category">
                        <h4>🔧 System Commands</h4>
                        <ul>
                            <li><span class="cmd">status</span> - Current availability</li>
                            <li><span class="cmd">neofetch</span> - System information</li>
                            <li><span class="cmd">clear</span> - Clear terminal</li>
                            <li><span class="cmd">sudo</span> - Admin access (try it! 😉)</li>
                        </ul>
                    </div>
                </div>
                <br>
                <div class="help-tips">
                    <h4>💡 Pro Tips</h4>
                    <ul>
                        <li>🔍 Use <span class="cmd">Tab</span> for auto-completion</li>
                        <li>⬆️⬇️ Arrow keys for command history</li>
                        <li>🤖 AI will help correct typos automatically</li>
                        <li>🎯 Try typing partial commands for suggestions</li>
                    </ul>
                </div>
            `,
            personalized: `
                <h3>Welcome back{{userName}}! 🎉</h3>
                <p>Here are your most used commands:</p>
                {{frequentCommands}}
                <br>
                {{standardHelp}}
            `,
            contextual: {
                first_visit: `
                    <h3>👋 Welcome to Mark's AI-Powered Terminal!</h3>
                    <p>This is an interactive portfolio experience. Here's how to get started:</p>
                    <div class="getting-started">
                        <h4>🚀 Quick Start</h4>
                        <ol>
                            <li>Try typing <span class="cmd">about</span> to learn about Ansh</li>
                            <li>Use <span class="cmd">projects</span> to see his work</li>
                            <li>Type <span class="cmd">skills</span> to view technical expertise</li>
                            <li>Don't worry about typos - AI will help! 🤖</li>
                        </ol>
                    </div>
                    {{standardHelp}}
                `,
                mobile: `
                    <h3>📱 Mobile Terminal Guide</h3>
                    <p>Tap the commands below or use the on-screen keyboard:</p>
                    <div class="mobile-commands">
                        <button class="mobile-cmd" data-cmd="about">About</button>
                        <button class="mobile-cmd" data-cmd="projects">Projects</button>
                        <button class="mobile-cmd" data-cmd="skills">Skills</button>
                        <button class="mobile-cmd" data-cmd="contact">Contact</button>
                    </div>
                    {{standardHelp}}
                `
            }
        });

        // Error response templates
        this.templates.set('error', {
            typo_correction: `
                <div class="ai-correction">
                    <div class="correction-header">🤖 AI Auto-Correction</div>
                    <p>I noticed you typed "<span class="error-input">{{originalInput}}</span>"</p>
                    <p>Did you mean <span class="correction-suggestion">{{suggestion}}</span>?</p>
                    <div class="correction-actions">
                        <button class="accept-correction" data-cmd="{{suggestion}}">✅ Yes, run it</button>
                        <button class="show-alternatives">🔍 Show alternatives</button>
                    </div>
                </div>
            `,
            multiple_suggestions: `
                <div class="suggestions-container">
                    <h4>🤔 Did you mean one of these?</h4>
                    <div class="suggestions-list">
                        {{#suggestions}}
                        <div class="suggestion-item">
                            <button class="suggestion-btn" data-cmd="{{command}}">
                                <span class="suggestion-cmd">{{command}}</span>
                                <span class="suggestion-reason">{{reason}}</span>
                                <span class="confidence-indicator" data-confidence="{{confidence}}"></span>
                            </button>
                        </div>
                        {{/suggestions}}
                    </div>
                </div>
            `,
            no_suggestions: `
                <div class="error-message">
                    <h4>❓ Command not recognized</h4>
                    <p>I couldn't find "<span class="unknown-input">{{input}}</span>" in my command database.</p>
                    
                    <div class="error-help">
                        <h5>💡 Here's what you can try:</h5>
                        <ul>
                            <li>Type <span class="cmd">help</span> to see all available commands</li>
                            <li>Check your spelling - I'll try to help with typos!</li>
                            <li>Try a partial command for auto-completion</li>
                        </ul>
                    </div>
                    
                    <div class="popular-commands">
                        <h5>🔥 Popular commands:</h5>
                        {{popularCommands}}
                    </div>
                </div>
            `,
            contextual: `
                <div class="contextual-error">
                    <p>🤖 Based on your recent activity, you might want to try:</p>
                    {{contextualSuggestions}}
                </div>
            `
        });

        // Success response templates
        this.templates.set('success', {
            command_executed: `
                <div class="success-message">
                    ✅ Command "<span class="executed-cmd">{{command}}</span>" executed successfully
                    {{#executionTime}}<span class="execution-time">({{executionTime}}ms)</span>{{/executionTime}}
                </div>
            `,
            ai_assisted: `
                <div class="ai-success">
                    🤖 <em>AI helped execute this command</em>
                    <div class="command-result">{{result}}</div>
                </div>
            `
        });

        // AI response templates
        this.templates.set('ai_responses', {
            thinking: [
                "🧠 Let me think about that...",
                "🤖 Processing your request...",
                "💭 Analyzing command patterns...",
                "🔍 Searching my knowledge base...",
                "⚡ Running AI analysis..."
            ],
            corrections: [
                "I think you meant '{{correction}}' - let me run that for you!",
                "Looks like a small typo! Running '{{correction}}' instead.",
                "Auto-correcting to '{{correction}}' and executing...",
                "I've got you covered! Executing '{{correction}}'."
            ],
            clarifications: [
                "I'm not quite sure what you mean. Could you try:",
                "That's interesting! Here's what I found that might help:",
                "Let me suggest some alternatives:",
                "Based on my analysis, you might want:"
            ]
        });

        // Contextual templates for different scenarios
        this.templates.set('contextual', {
            welcome: {
                first_time: "👋 Welcome! This is your first visit to Ansh's portfolio.",
                returning: "Welcome back{{userName}}! {{daysSince}} since your last visit.",
                frequent: "Hey there, frequent visitor! 🌟"
            },
            time_based: {
                morning: "Good morning! ☀️",
                afternoon: "Good afternoon! 🌤️",
                evening: "Good evening! 🌅",
                night: "Working late? 🌙"
            },
            device_specific: {
                mobile: "📱 I see you're on mobile - tap commands or use voice input!",
                tablet: "📱 Tablet experience optimized for touch interactions.",
                desktop: "💻 Full desktop experience with all features enabled."
            }
        });

        // Command-specific enhanced templates
        this.initializeCommandTemplates();
    }

    initializeCommandTemplates() {
        // About command with personalized variations
        this.templates.set('about', {
            standard: `
                <div class="about-section">
                    <div class="profile-header">
                        <h3>👨‍💻 About Ansh Sahu</h3>
                        <div class="status-badge">
                            <span class="status-dot"></span>
                            Available for opportunities
                        </div>
                    </div>
                    
                    <div class="about-content">
                        <p>🚀 Passionate <strong>Full Stack Developer</strong> based in Guwahati, Assam, India, with a focus on building innovative solutions that make a difference.</p>
                        
                        <div class="highlights">
                            <div class="highlight-item">
                                <span class="icon">💡</span>
                                <span>Currently: B.Tech Student in Computer Science</span>
                            </div>
                            <div class="highlight-item">
                                <span class="icon">🏆</span>
                                <span>Recent: Software Development Intern at Bookdash</span>
                            </div>
                            <div class="highlight-item">
                                <span class="icon">👥</span>
                                <span>Impact: 3,300+ users across multiple platforms</span>
                            </div>
                            <div class="highlight-item">
                                <span class="icon">🔧</span>
                                <span>Expertise: Full-stack development, AI integration</span>
                            </div>
                        </div>
                        
                        <div class="quick-facts">
                            <h4>⚡ Quick Facts</h4>
                            <ul>
                                <li>🌍 Location: Guwahati, Assam, India</li>
                                <li>🎯 Focus: Software Engineering & Full-stack Development</li>
                                <li>💼 Current: B.Tech Student (2023-2027)</li>
                                <li>🌟 Passion: Creating impactful technology</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="about-footer">
                        <p><em>Want to know more? Try <span class="cmd">skills</span>, <span class="cmd">experience</span>, or <span class="cmd">projects</span>!</em></p>
                    </div>
                </div>
            `,
            personalized: `
                {{#returning_visitor}}
                <p>Welcome back! Since your last visit, I've:</p>
                <ul>
                    <li>✨ Enhanced my AI capabilities</li>
                    <li>🚀 Added new project insights</li>
                    <li>📈 Improved user experience</li>
                </ul>
                {{/returning_visitor}}
                {{standardAbout}}
            `
        });

        // Projects with dynamic sorting
        this.templates.set('projects', {
            standard: `
                <div class="projects-section">
                    <h3>🚀 Featured Projects</h3>
                    <div class="projects-grid">
                        {{#projects}}
                        <div class="project-card" data-tech="{{tech}}">
                            <div class="project-header">
                                <h4>{{icon}} {{name}}</h4>
                                <div class="project-tags">
                                    {{#tags}}
                                    <span class="tag">{{.}}</span>
                                    {{/tags}}
                                </div>
                            </div>
                            <div class="project-content">
                                <p>{{description}}</p>
                                {{#metrics}}
                                <div class="project-metrics">
                                    <span class="metric">{{.}}</span>
                                </div>
                                {{/metrics}}
                            </div>
                            {{#achievement}}
                            <div class="achievement-badge">🏆 {{achievement}}</div>
                            {{/achievement}}
                        </div>
                        {{/projects}}
                    </div>
                </div>
            `,
            interactive: `
                <div class="interactive-projects">
                    <div class="project-filters">
                        <button class="filter-btn active" data-filter="all">All Projects</button>
                        <button class="filter-btn" data-filter="ai">AI/ML</button>
                        <button class="filter-btn" data-filter="web">Web Dev</button>
                        <button class="filter-btn" data-filter="startup">Startup</button>
                    </div>
                    {{standardProjects}}
                </div>
            `
        });

        // Dynamic status template
        this.templates.set('status', {
            standard: `
                <div class="status-display">
                    <div class="status-header">
                        <h3>📊 Current Status</h3>
                        <div class="last-updated">Updated: {{timestamp}}</div>
                    </div>
                    
                    <div class="status-grid">
                        <div class="status-item availability">
                            <div class="status-indicator {{availability_class}}"></div>
                            <span>{{availability_text}}</span>
                        </div>
                        
                        <div class="status-item current-work">
                            <span class="icon">💼</span>
                            <span>{{current_position}}</span>
                        </div>
                        
                        <div class="status-item location">
                            <span class="icon">📍</span>
                            <span>{{location}}</span>
                        </div>
                        
                        <div class="status-item focus">
                            <span class="icon">🎯</span>
                            <span>{{current_focus}}</span>
                        </div>
                    </div>
                    
                    {{#recent_activity}}
                    <div class="recent-activity">
                        <h4>🔥 Recent Activity</h4>
                        <ul>
                            {{#activities}}
                            <li>{{icon}} {{description}} <span class="activity-time">{{time}}</span></li>
                            {{/activities}}
                        </ul>
                    </div>
                    {{/recent_activity}}
                </div>
            `
        });
    }

    initializeContextualModifiers() {
        this.contextualModifiers.set('time_of_day', {
            morning: (template) => template.replace('{{greeting}}', 'Good morning! ☀️'),
            afternoon: (template) => template.replace('{{greeting}}', 'Good afternoon! 🌤️'),
            evening: (template) => template.replace('{{greeting}}', 'Good evening! 🌅'),
            night: (template) => template.replace('{{greeting}}', 'Working late? 🌙')
        });

        this.contextualModifiers.set('device_type', {
            mobile: (template) => this.addMobileOptimizations(template),
            tablet: (template) => this.addTabletOptimizations(template),
            desktop: (template) => template // No modifications needed
        });

        this.contextualModifiers.set('user_experience', {
            first_time: (template) => this.addNewUserGuidance(template),
            returning: (template) => this.addReturningUserFeatures(template),
            expert: (template) => this.addAdvancedFeatures(template)
        });
    }

    // Main template rendering method
    renderTemplate(templateName, context = {}, options = {}) {
        try {
            const template = this.getTemplate(templateName, context);
            const processedTemplate = this.processTemplate(template, context, options);
            const finalTemplate = this.applyContextualModifiers(processedTemplate, context);

            return this.sanitizeAndFormat(finalTemplate);
        } catch (error) {
            console.error('Template rendering error:', error);
            return this.getFallbackTemplate(templateName, context);
        }
    }

    // Get appropriate template based on context
    getTemplate(templateName, context) {
        const templates = this.templates.get(templateName);
        if (!templates) {
            throw new Error(`Template '${templateName}' not found`);
        }

        // Choose template variant based on context
        if (context.personalized && templates.personalized) {
            return templates.personalized;
        }

        if (context.interactive && templates.interactive) {
            return templates.interactive;
        }

        // Check for contextual templates
        if (context.variant && templates.contextual && templates.contextual[context.variant]) {
            return templates.contextual[context.variant];
        }

        return templates.standard || templates;
    }

    // Process template with variable substitution
    processTemplate(template, context, options) {
        let processed = template;

        // Handle Mustache-style variables {{variable}}
        processed = processed.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
            const value = this.getVariableValue(variable.trim(), context);
            return value !== undefined ? value : match;
        });

        // Handle conditional blocks {{#condition}}...{{/condition}}
        processed = this.processConditionalBlocks(processed, context);

        // Handle loops {{#array}}...{{/array}}
        processed = this.processLoops(processed, context);

        // Apply dynamic data
        processed = this.applyDynamicData(processed, context);

        return processed;
    }

    // Get variable value with dot notation support
    getVariableValue(variable, context) {
        const parts = variable.split('.');
        let value = context;

        for (const part of parts) {
            if (value && typeof value === 'object' && part in value) {
                value = value[part];
            } else {
                return this.getDefaultValue(variable, context);
            }
        }

        return value;
    }

    // Get default values for common variables
    getDefaultValue(variable, context) {
        const defaults = {
            'userName': this.personalization.userName === 'User' ? '' : `, ${this.personalization.userName}`,
            'timestamp': new Date().toLocaleString(),
            'greeting': this.getTimeBasedGreeting(),
            'availability_class': 'available',
            'availability_text': 'Available for opportunities',
            'current_position': 'B.Tech Student in Computer Science',
            'location': 'Guwahati, Assam, India',
            'current_focus': 'AI-powered solutions & full-stack development'
        };

        return defaults[variable];
    }

    // Process conditional blocks
    processConditionalBlocks(template, context) {
        return template.replace(/\{\{#([^}]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, condition, content) => {
            const conditionValue = this.getVariableValue(condition, context);

            if (this.isConditionTrue(conditionValue)) {
                return this.processTemplate(content, context);
            }

            return '';
        });
    }

    // Process loops
    processLoops(template, context) {
        return template.replace(/\{\{#([^}]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, arrayName, itemTemplate) => {
            const array = this.getVariableValue(arrayName, context);

            if (Array.isArray(array)) {
                return array.map(item => {
                    const itemContext = { ...context, ...item };
                    return this.processTemplate(itemTemplate, itemContext);
                }).join('');
            }

            return '';
        });
    }

    // Apply dynamic data (real-time information)
    applyDynamicData(template, context) {
        const dynamicData = this.getDynamicData(context);

        for (const [key, value] of Object.entries(dynamicData)) {
            const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            template = template.replace(placeholder, value);
        }

        return template;
    }

    // Get real-time dynamic data
    getDynamicData(context) {
        return {
            current_time: new Date().toLocaleTimeString(),
            current_date: new Date().toLocaleDateString(),
            visit_count: this.getVisitCount(),
            session_duration: this.getSessionDuration(),
            commands_this_session: context.sessionCommands || 0,
            browser_info: this.getBrowserInfo(),
            responsive_class: this.getResponsiveClass()
        };
    }

    // Apply contextual modifiers
    applyContextualModifiers(template, context) {
        let modified = template;

        // Apply time-based modifications
        const timeOfDay = this.getTimeOfDay();
        const timeModifier = this.contextualModifiers.get('time_of_day')?.[timeOfDay];
        if (timeModifier) {
            modified = timeModifier(modified);
        }

        // Apply device-based modifications
        const deviceType = this.getDeviceType();
        const deviceModifier = this.contextualModifiers.get('device_type')?.[deviceType];
        if (deviceModifier) {
            modified = deviceModifier(modified);
        }

        // Apply experience-based modifications
        const userExperience = this.getUserExperienceLevel();
        const experienceModifier = this.contextualModifiers.get('user_experience')?.[userExperience];
        if (experienceModifier) {
            modified = experienceModifier(modified);
        }

        return modified;
    }

    // Error response generation
    generateErrorResponse(error, context = {}) {
        const errorType = error.strategy || 'no_suggestions';

        const errorContext = {
            ...context,
            originalInput: error.input,
            suggestions: error.suggestions || [],
            errorType: errorType,
            confidence: error.confidence || 0,
            canAutoCorrect: error.canAutoCorrect || false
        };

        return this.renderTemplate('error', errorContext, { variant: errorType });
    }

    // Success response generation
    generateSuccessResponse(command, result, context = {}) {
        const successContext = {
            ...context,
            command: command,
            result: result,
            executionTime: context.executionTime,
            aiAssisted: context.aiAssisted || false
        };

        const variant = context.aiAssisted ? 'ai_assisted' : 'command_executed';
        return this.renderTemplate('success', successContext, { variant });
    }

    // AI response generation
    generateAIResponse(type, data, context = {}) {
        const aiTemplates = this.templates.get('ai_responses')?.[type];
        if (!aiTemplates) return null;

        if (Array.isArray(aiTemplates)) {
            const randomTemplate = aiTemplates[Math.floor(Math.random() * aiTemplates.length)];
            return this.processTemplate(randomTemplate, { ...context, ...data });
        }

        return this.processTemplate(aiTemplates, { ...context, ...data });
    }

    // Utility methods
    addMobileOptimizations(template) {
        return template.replace(
            /<div class="([^"]*)">/g,
            '<div class="$1 mobile-optimized">'
        );
    }

    addTabletOptimizations(template) {
        return template.replace(
            /<div class="([^"]*)">/g,
            '<div class="$1 tablet-optimized">'
        );
    }

    addNewUserGuidance(template) {
        const guidance = `
            <div class="new-user-guidance">
                💡 <em>New here? Try these popular commands: about, projects, skills</em>
            </div>
        `;
        return guidance + template;
    }

    addReturningUserFeatures(template) {
        const welcomeBack = `
            <div class="returning-user-welcome">
                👋 <em>Welcome back! Here's what's new since your last visit.</em>
            </div>
        `;
        return welcomeBack + template;
    }

    addAdvancedFeatures(template) {
        const advanced = `
            <div class="advanced-features">
                🚀 <em>Pro tip: Try using command chaining with && or explore hidden commands!</em>
            </div>
        `;
        return template + advanced;
    }

    sanitizeAndFormat(template) {
        // Remove excessive whitespace
        return template.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
    }

    getFallbackTemplate(templateName, context) {
        return `
            <div class="fallback-response">
                <h3>⚠️ Template Error</h3>
                <p>Sorry, there was an issue loading the response for "${templateName}".</p>
                <p>Please try again or type <span class="cmd">help</span> for available commands.</p>
            </div>
        `;
    }

    // Helper methods for dynamic data
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        if (hour < 21) return 'evening';
        return 'night';
    }

    getTimeBasedGreeting() {
        const greetings = {
            morning: 'Good morning! ☀️',
            afternoon: 'Good afternoon! 🌤️',
            evening: 'Good evening! 🌅',
            night: 'Working late? 🌙'
        };
        return greetings[this.getTimeOfDay()];
    }

    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }

    getUserExperienceLevel() {
        const visitCount = this.getVisitCount();
        if (visitCount === 1) return 'first_time';
        if (visitCount < 5) return 'returning';
        return 'expert';
    }

    getVisitCount() {
        const count = localStorage.getItem('portfolio_visit_count') || '0';
        return parseInt(count);
    }

    getSessionDuration() {
        const start = sessionStorage.getItem('session_start') || Date.now();
        return Math.floor((Date.now() - start) / 1000);
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Other';
    }

    getResponsiveClass() {
        return `responsive-${this.getDeviceType()}`;
    }

    isConditionTrue(value) {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value.length > 0;
        if (typeof value === 'number') return value !== 0;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object') return value !== null;
        return false;
    }

    // Personalization methods
    loadPersonalizationData() {
        try {
            const saved = localStorage.getItem('portfolio_personalization');
            if (saved) {
                this.personalization = { ...this.personalization, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load personalization data:', error);
        }
    }

    updatePersonalization(data) {
        this.personalization = { ...this.personalization, ...data };
        try {
            localStorage.setItem('portfolio_personalization', JSON.stringify(this.personalization));
        } catch (error) {
            console.warn('Failed to save personalization data:', error);
        }
    }

    // Template caching for performance
    cacheTemplate(key, template) {
        if (!this.templateCache) {
            this.templateCache = new Map();
        }
        this.templateCache.set(key, template);
    }

    getCachedTemplate(key) {
        return this.templateCache?.get(key);
    }
}

// Export for use in other files
window.ResponseTemplateEngine = ResponseTemplateEngine;
