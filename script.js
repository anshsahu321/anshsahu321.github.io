class PortfolioTerminal {
    constructor() {
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');
        this.card = document.getElementById('interactiveCard');
        this.commandHistory = [];
        this.historyIndex = -1;

        // AI Typing properties
        this.aiTyping = false;
        this.aiTypingTimeout = null;
        this.aiTypingSpeed = 100;
        this.aiThinkingTime = 500;

        // Mouse tracking for card rotation
        this.mouseX = 0;
        this.mouseY = 0;
        this.cardX = 0;
        this.cardY = 0;
        this.isDragging = false;

        this.commands = {
            help: this.showHelp.bind(this),
            about: this.showAbout.bind(this),
            projects: this.showProjects.bind(this),
            skills: this.showSkills.bind(this),
            experience: this.showExperience.bind(this),
            contact: this.showContact.bind(this),
            education: this.showEducation.bind(this),
            certifications: this.showCertifications.bind(this),
            leadership: this.showLeadership.bind(this),
            sudo: this.showSudo.bind(this),
            clear: this.clearTerminal.bind(this),
            whoami: this.whoAmI.bind(this),
            ls: this.listFiles.bind(this),
            pwd: this.showPath.bind(this),
            cat: this.catFile.bind(this),
            neofetch: this.showNeofetch.bind(this),
            status: this.showStatus.bind(this)
        };

        this.init();
    }

    init() {
        // Ensure input element exists
        if (!this.input) {
            console.error('Terminal input element not found!');
            return;
        }

        // Terminal input handlers
        this.input.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.input.addEventListener('input', this.handleInput.bind(this));

        // Force focus on input
        this.input.focus();
        this.input.disabled = false;

        // Keep input focused
        document.addEventListener('click', (e) => {
            if (!e.target.classList.contains('nav-cmd') &&
                !e.target.closest('.interactive-card') &&
                !this.aiTyping) {
                setTimeout(() => this.input.focus(), 10);
            }
        });

        // Navigation command handlers
        document.querySelectorAll('.nav-cmd').forEach(cmd => {
            cmd.addEventListener('click', () => {
                const command = cmd.getAttribute('data-cmd');
                if (!this.aiTyping) {
                    this.triggerAITyping(command);
                }
            });
        });

        // Card interaction handlers
        this.initCardInteraction();

        console.log('Terminal initialized successfully');
        console.log('Input element:', this.input);
        console.log('Input focused:', document.activeElement === this.input);
    }

    handleInput(event) {
        // If user starts typing while not in AI mode, allow normal input
        if (!this.aiTyping && event.target.value.length > 0) {
            this.stopAITyping();
        }
    }

    handleKeyDown(event) {
        console.log('Key pressed:', event.key, 'AI typing:', this.aiTyping);

        if (this.aiTyping) {
            if (event.key === 'Escape') {
                event.preventDefault();
                this.stopAITyping();
                this.addOutput(`
                    <div class="output-content" style="color: #ef4444;">
                        🤖 AI typing cancelled by user
                    </div>
                `);
                return;
            }
            event.preventDefault();
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            const command = this.input.value.trim().toLowerCase();
            if (command) {
                // Check if it's an AI command
                if (command.startsWith('ai ')) {
                    const aiCommand = command.substring(3);
                    if (this.commands[aiCommand]) {
                        this.addCommandLine(command);
                        this.triggerAITyping(aiCommand);
                        this.commandHistory.unshift(command);
                        this.historyIndex = -1;
                        this.input.value = '';
                        return;
                    }
                }

                this.executeCommand(command);
                this.commandHistory.unshift(command);
                this.historyIndex = -1;
            }
            this.input.value = '';
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.navigateHistory(1);
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.navigateHistory(-1);
        } else if (event.key === 'Tab') {
            event.preventDefault();
            this.handleTabCompletion();
        }
    }

    triggerAITyping(command) {
        if (this.aiTyping) return;

        this.aiTyping = true;
        this.input.classList.add('ai-active');
        this.input.value = '';
        this.input.disabled = true;

        // Show thinking indicator
        const thinkingIndicator = document.createElement('div');
        thinkingIndicator.className = 'ai-thinking';
        thinkingIndicator.innerHTML = '🤖 AI is thinking...';
        thinkingIndicator.style.position = 'absolute';
        thinkingIndicator.style.right = '20px';
        thinkingIndicator.style.top = '10px';
        thinkingIndicator.style.fontSize = '12px';
        document.querySelector('.input-line').style.position = 'relative';
        document.querySelector('.input-line').appendChild(thinkingIndicator);

        setTimeout(() => {
            thinkingIndicator.remove();
            this.startAITyping(command);
        }, this.aiThinkingTime);
    }

    startAITyping(command) {
        let currentIndex = 0;
        const typeNextCharacter = () => {
            if (currentIndex < command.length) {
                const currentChar = command[currentIndex];
                this.input.value += currentChar;
                this.animateNewCharacter();
                currentIndex++;
                this.aiTypingTimeout = setTimeout(typeNextCharacter,
                    this.aiTypingSpeed + Math.random() * 50);
            } else {
                setTimeout(() => {
                    this.completeAITyping(command);
                }, 500);
            }
        };
        typeNextCharacter();
    }

    animateNewCharacter() {
        this.input.style.boxShadow = '0 0 5px rgba(16, 185, 129, 0.3)';
        setTimeout(() => {
            this.input.style.boxShadow = 'none';
        }, 150);
    }

    completeAITyping(command) {
        this.aiTyping = false;
        this.input.classList.remove('ai-active');
        this.input.disabled = false;

        this.executeCommand(command);
        this.commandHistory.unshift(command);
        this.historyIndex = -1;
        this.input.value = '';

        setTimeout(() => {
            this.input.focus();
        }, 100);
    }

    stopAITyping() {
        if (this.aiTypingTimeout) {
            clearTimeout(this.aiTypingTimeout);
            this.aiTypingTimeout = null;
        }
        this.aiTyping = false;
        this.input.classList.remove('ai-active');
        this.input.disabled = false;

        const thinkingIndicator = document.querySelector('.ai-thinking');
        if (thinkingIndicator) {
            thinkingIndicator.remove();
        }

        setTimeout(() => {
            this.input.focus();
        }, 100);
    }

    navigateHistory(direction) {
        if (this.aiTyping) return;

        this.historyIndex += direction;
        if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length - 1;
        } else if (this.historyIndex < -1) {
            this.historyIndex = -1;
        }

        if (this.historyIndex >= 0) {
            this.input.value = this.commandHistory[this.historyIndex];
        } else {
            this.input.value = '';
        }
    }

    handleTabCompletion() {
        if (this.aiTyping) return;

        const inputValue = this.input.value.toLowerCase();
        const matchingCommands = Object.keys(this.commands).filter(cmd =>
            cmd.startsWith(inputValue)
        );

        if (matchingCommands.length === 1) {
            this.input.value = matchingCommands[0];
        } else if (matchingCommands.length > 1) {
            this.addOutput(`<div class="output-content">${matchingCommands.join('  ')}</div>`);
        }
    }

    executeCommand(command) {
        this.addCommandLine(command);

        if (this.commands[command]) {
            this.commands[command]();
        } else {
            this.addOutput(`
                <div class="output-content error">
                    bash: ${command}: command not found
                    <br>Type 'help' to see available commands.
                </div>
            `);
        }

        this.scrollToBottom();
    }

    addCommandLine(command) {
        const commandBlock = document.createElement('div');
        commandBlock.className = 'output-block';
        commandBlock.innerHTML = `
            <div class="output-command">ansh@portfolio:~$ ${command}</div>
        `;
        this.output.appendChild(commandBlock);
    }

    addOutput(content) {
        const outputBlock = document.createElement('div');
        outputBlock.className = 'output-block';
        outputBlock.innerHTML = `<div class="output-content">${content}</div>`;
        this.output.appendChild(outputBlock);
    }

    scrollToBottom() {
        this.output.scrollTop = this.output.scrollHeight;
    }

    initCardInteraction() {
        if (!this.card) return;

        this.card.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.card.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.mouseX;
                const deltaY = e.clientY - this.mouseY;

                this.cardX += deltaX * 0.5;
                this.cardY -= deltaY * 0.5;

                this.cardX = Math.max(-45, Math.min(45, this.cardX));
                this.cardY = Math.max(-45, Math.min(45, this.cardY));

                this.card.style.transform = `rotateY(${this.cardX}deg) rotateX(${this.cardY}deg)`;

                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.card.style.cursor = 'grab';

                const returnToCenter = () => {
                    this.cardX *= 0.95;
                    this.cardY *= 0.95;

                    if (Math.abs(this.cardX) > 0.5 || Math.abs(this.cardY) > 0.5) {
                        this.card.style.transform = `rotateY(${this.cardX}deg) rotateX(${this.cardY}deg)`;
                        requestAnimationFrame(returnToCenter);
                    } else {
                        this.cardX = 0;
                        this.cardY = 0;
                        this.card.style.transform = 'rotateY(0deg) rotateX(0deg)';
                    }
                };

                setTimeout(returnToCenter, 1000);
            }
        });
    }

    // All command methods
    showHelp() {
        const helpText = `
            <h3>Available Commands</h3>
            <ul>
                <li><span class="highlight">help</span> - Show this help message</li>
                <li><span class="highlight">about</span> - Learn about me</li>
                <li><span class="highlight">projects</span> - View my featured projects</li>
                <li><span class="highlight">skills</span> - Display technical skills</li>
                <li><span class="highlight">experience</span> - Show work experience</li>
                <li><span class="highlight">contact</span> - Get contact information</li>
                <li><span class="highlight">education</span> - View educational background</li>
                <li><span class="highlight">certifications</span> - Show certifications</li>
                <li><span class="highlight">leadership</span> - Display leadership experience</li>
                <li><span class="highlight">neofetch</span> - Display system information</li>
                <li><span class="highlight">status</span> - Show current status</li>
                <li><span class="highlight">whoami</span> - Display current user</li>
                <li><span class="highlight">ls</span> - List directory contents</li>
                <li><span class="highlight">pwd</span> - Print working directory</li>
                <li><span class="highlight">clear</span> - Clear the terminal</li>
                <li><span class="highlight">sudo</span> - Execute as superuser 😉</li>
            </ul>
            <br>
            <p>💡 <em>Tip: Use Tab for auto-completion, ↑↓ for command history, Escape to stop AI typing</em></p>
        `;
        this.addOutput(helpText);
    }

    showAbout() {
        const aboutText = `
            <h3>About Ansh Sahu</h3>
            <p>👋 Hello! I'm <span class="highlight">Ansh Sahu</span>, a passionate Full Stack Developer and B.Tech Computer Science student.</p>
            <br>
            <p>🚀 I specialize in building scalable web applications, AI-powered solutions, blockchain/Web3 technologies, and innovative digital experiences using modern tech stacks.</p>
            <p>💡 My passion lies in solving complex problems with elegant code and creating impactful technology solutions across diverse domains.</p>
            <p>🎯 Currently pursuing <span class="highlight">B.Tech in Computer Science and Engineering</span> while gaining hands-on industry experience through multiple internships.</p>
            <br>
            <p>📍 <strong>Location:</strong> Guwahati, Assam, India</p>
            <p>🎓 <strong>Education:</strong> B.Tech in Computer Science and Engineering (2023-2027)</p>
            <p>💼 <strong>Recent Experience:</strong> Software Engineer at LEYAN Global Trade Company, Summer Intern at Web3Assam, Software Development Intern at Bookdash</p>
            <p>🌟 <strong>Interests:</strong> Full-stack Development, Web3/Blockchain, AI/ML, Open Source Contributions</p>
            <br>
            <p>🏆 <strong>Notable Achievements:</strong> 3 completed professional internships, Active GitHub contributor, E-Learning Platform developer</p>
        `;
        this.addOutput(aboutText);
    }

    showProjects() {
        const projectsText = `
            <h3>Featured Projects</h3>
            <ul>
                <li><strong>📚 E-Learning Platform</strong>
                    <br>Built with Next.JS, Tailwind CSS, Gemini, Prisma, and Shaden
                    <br>E-commerce-style platform for course browsing and purchasing
                    <br>Responsive frontend with AI-driven diagram generation</li>
                <li><strong>🤖 MeetingMind-AI</strong>
                    <br>Modern web app for effortless meeting productivity
                    <br>Features: Live transcription, auto-generated summaries, real-time speaker detection
                    <br>Integrations with Zoom, Google Meet, and more</li>
                <li><strong>📧 AI-Email-Summarizer</strong>
                    <br>Comprehensive email processing pipeline
                    <br>AI-powered analysis, summarization, and distribution
                    <br>Multi-channel email content management</li>
                <li><strong>💰 FinanceAI-Pro</strong>
                    <br>AI-powered personal finance management application
                    <br>Intelligent insights and automated categorization
                    <br>Personalized recommendations with beautiful UI</li>
                <li><strong>👨‍🍳 Chef-AI (Contributor)</strong>
                    <br>Contributed to AI-powered cooking assistant platform
                    <br>Open-source collaboration</li>
                <li><strong>📞 AI Calling Platform (Contributor)</strong>
                    <br>Contributed to intelligent voice calling system
                    <br>Open-source development</li>
            </ul>
        `;
        this.addOutput(projectsText);
    }

    showSkills() {
        const skillsText = `
            <h3>Technical Skills</h3>
            <ul>
                <li><strong>💻 Languages:</strong> TypeScript, JavaScript, Solidify, Python, SQL (Postgres), HTML/CSS</li>
                <li><strong>🎨 Frontend:</strong> React.js, Next.JS, Shaden-UI, Tailwind CSS, Responsive Design</li>
                <li><strong>⚙️ Backend:</strong> Node.js, Express.JS, RESTful APIs</li>
                <li><strong>🗄️ Databases:</strong> PostgreSQL, Prisma ORM</li>
                <li><strong>⛓️ Web3/Blockchain:</strong> Smart Contracts, Decentralized Applications (dApps), Web3 Technologies</li>
                <li><strong>☁️ Cloud & DevOps:</strong> Google Cloud Platform, Docker, Git</li>
                <li><strong>🔧 Developer Tools:</strong> Git, VS Code, Visual Studio, Docker</li>
                <li><strong>🤖 AI/ML:</strong> OpenAI Integration, Gemini AI, AI-powered applications</li>
                <li><strong>📚 Libraries:</strong> Tailwind CSS, OpenAI, Prisma</li>
            </ul>
            <br>
            <p>🌟 <strong>Specializations:</strong> Full-stack Development, Web3/Blockchain, AI Integration, E-Learning Platforms, Global Trade Systems</p>
        `;
        this.addOutput(skillsText);
    }

    showExperience() {
        const experienceText = `
            <h3>Work Experience</h3>
            <ul>
                <li><strong>💼 Software Engineer - LEYAN Global Trade Company</strong>
                    <br>July 2025 - August 2025 (2 months)
                    <br>Kanpur, Uttar Pradesh
                    <br>• Developed and optimized software solutions for global trade operations
                    <br>• Implemented features to streamline international trade processes and documentation
                    <br>• Collaborated with cross-functional teams to enhance system efficiency and user experience
                    <br>• Worked on trade management systems and logistics automation</li>
                <li><strong>🌐 Summer Intern - Web3Assam®</strong>
                    <br>June 2025 - August 2025 (3 months) - Remote
                    <br>• Contributed to Web3 and blockchain-based projects in the emerging technology space
                    <br>• Developed decentralized applications (dApps) using modern Web3 technologies
                    <br>• Worked on smart contract integration and blockchain solutions
                    <br>• Participated in research and development of innovative Web3 applications for the Assam region</li>
                <li><strong>💻 Software Development Intern - Bookdash</strong>
                    <br>Sept 2024 - Nov 2024 (3 months) - Remote - <span class="highlight">Completed</span>
                    <br>• Designed and implemented a new software application, resulting in a 20% increase in efficiency
                    <br>• Led a project to integrate third-party APIs, reducing data redundancy and improving data quality
                    <br>• Collaborated with the product team to deliver tailor-made solutions that increased product functionality by 35%
                    <br>• Successfully completed 3-month internship with commendation for dedication and quality of work</li>
                <li><strong>🚀 Open Source Contributor</strong>
                    <br>Ongoing
                    <br>• Active contributor to Chef-AI (AI-powered cooking assistant platform)
                    <br>• Contributed to AI Calling Platform (intelligent voice calling system)
                    <br>• Developed multiple personal projects including MeetingMind-AI, AI-Email-Summarizer, and FinanceAI-Pro</li>
            </ul>
        `;
        this.addOutput(experienceText);
    }

    showContact() {
        const contactText = `
            <h3>Contact Information</h3>
            <ul>
                <li>📧 <strong>Email:</strong> as.shawansh@gmail.com</li>
                <li>📱 <strong>Phone:</strong> +91 9485319239</li>
                <li>💼 <strong>LinkedIn:</strong> linkedin.com/in/anshsahu</li>
                <li>🐙 <strong>GitHub:</strong> github.com/anshsahu321</li>
                <li>📍 <strong>Location:</strong> Guwahati, Assam, India</li>
                <li>💬 <strong>Languages:</strong> English, Hindi</li>
            </ul>
            <br>
            <p>🤝 <strong>Open to:</strong> Full-time opportunities, internships, collaborations</p>
            <p>⚡ <strong>Response Time:</strong> Usually within 24 hours</p>
        `;
        this.addOutput(contactText);
    }

    showEducation() {
        const educationText = `
            <h3>Education & Learning</h3>
            <ul>
                <li><strong>🎓 Bachelor of Technology in Computer Science and Engineering</strong>
                    <br>Guwahati, Assam, India
                    <br>Aug 2023 - June 2027 (Expected)
                    <br>Focus on Software Engineering, AI/ML, and Full-stack Development</li>
                <li><strong>💻 Continuous Learning</strong>
                    <br>Self-directed learning in cutting-edge technologies
                    <br>Next.JS, React, TypeScript, AI integration, Cloud platforms</li>
                <li><strong>🌟 Industry Experience</strong>
                    <br>Software Development Intern at Bookdash
                    <br>Hands-on experience with real-world applications</li>
            </ul>
        `;
        this.addOutput(educationText);
    }

    showCertifications() {
        const certificationsText = `
            <h3>Certifications & Achievements</h3>
            <ul>
                <li>💼 Software Engineer - LEYAN Global Trade Company (July 2025 - Aug 2025)</li>
                <li>🌐 Summer Intern - Web3Assam® (June 2025 - Aug 2025)</li>
                <li>💻 Software Development Intern - Bookdash (Sept 2024 - Nov 2024)</li>
                <li>⚡ Full-Stack Development with Next.JS and React</li>
                <li>🎯 TypeScript and JavaScript Specialist</li>
                <li>⛓️ Web3 and Blockchain Development</li>
                <li>🤖 AI Integration Expert (OpenAI, Gemini)</li>
                <li>☁️ Google Cloud Platform Experience</li>
                <li>🐙 Active Open Source Contributor</li>
                <li>📊 Database Management with Prisma and PostgreSQL</li>
            </ul>
            <br>
            <p>🚀 <strong>Focus Areas:</strong> Full-stack development, Web3/Blockchain, AI-powered applications, Global trade systems</p>
        `;
        this.addOutput(certificationsText);
    }

    showLeadership() {
        const leadershipText = `
            <h3>Leadership & Impact</h3>
            <ul>
                <li>🚀 <strong>Project Lead</strong> - E-Learning Platform development with modern tech stack</li>
                <li>💼 <strong>Multi-Domain Experience</strong> - Worked across Global Trade (LEYAN), Web3/Blockchain (Web3Assam), and EdTech (Bookdash)</li>
                <li>🎯 <strong>Open Source Contributor</strong> - Active contributions to Chef-AI and AI Calling Platform</li>
                <li>💡 <strong>Innovation</strong> - Built multiple AI-powered applications and Web3 solutions</li>
                <li>🌟 <strong>Team Collaboration</strong> - Delivered 35% functionality increase at Bookdash, contributed to trade systems at LEYAN</li>
                <li>⛓️ <strong>Web3 Pioneer</strong> - Developed decentralized applications and blockchain solutions at Web3Assam</li>
                <li>🤝 <strong>Problem Solver</strong> - Reduced data redundancy through API integration, optimized trade operations</li>
            </ul>
            <br>
            <p>🎯 <strong>Approach:</strong> Collaborative, innovation-driven, quality-focused, multi-domain expertise</p>
            <p>💪 <strong>Impact:</strong> 3 completed internships, improved efficiency by 20%, multiple successful projects across diverse tech stacks</p>
        `;
        this.addOutput(leadershipText);
    }

    showNeofetch() {
        const neofetchText = `
            <div class="success">
                <pre>
                    ╭─────────────────────────────╮
                    │     Ansh Sahu - Portfolio   │
                    ╰─────────────────────────────╯
                    
                    OS: Portfolio Terminal v2.0
                    Host: github.com/anshsahu321
                    Kernel: Next.JS 14.0.0
                    Uptime: 2+ years experience
                    Packages: React, TypeScript, Web3, AI/ML
                    Shell: Interactive Terminal
                    Resolution: Full-stack solutions
                    Terminal: Professional development
                    CPU: Full Stack Developer
                    GPU: AI Integration specialist
                    Memory: Multiple successful projects
                </pre>
            </div>
        `;
        this.addOutput(neofetchText);
    }

    showStatus() {
        const statusText = `
            <h3>Current Status</h3>
            <div class="success">
                <p>🟢 <strong>Available for opportunities</strong></p>
                <p>🎓 Currently: B.Tech Student in Computer Science (2023-2027)</p>
                <p>🚀 Building: AI-powered applications, Web3 solutions, and full-stack platforms</p>
                <p>💼 Recent: Completed 3 professional internships (LEYAN, Web3Assam, Bookdash)</p>
                <p>📍 Location: Guwahati, Assam, India</p>
                <p>⏰ Last updated: ${new Date().toLocaleDateString()}</p>
            </div>
            <br>
            <p>🎯 <strong>Looking for:</strong> Software engineering internships and full-time roles</p>
            <p>⚡ <strong>Specializing in:</strong> Next.JS, React, TypeScript, Web3, AI integration</p>
            <p>🤝 <strong>Open to:</strong> Remote, hybrid, or on-site opportunities</p>
        `;
        this.addOutput(statusText);
    }

    showSudo() {
        const sudoText = `
            <div class="error">
                [sudo] password for ansh: ********
                <br><br>
                Sorry, ansh is not in the sudoers file. This incident will be reported. 😄
                <br><br>
                But hey, you can still explore everything else with regular user privileges!
                <br>Try 'help' to see what commands are available to you.
            </div>
        `;
        this.addOutput(sudoText);
    }

    whoAmI() {
        this.addOutput('<div class="success">ansh</div>');
    }

    listFiles() {
        const lsText = `
            <div class="success">
                drwxr-xr-x  5 ansh ansh 4096 Feb 10 02:50 <span class="highlight">projects/</span>
                -rw-r--r--  1 ansh ansh 2048 Feb 10 02:50 <span style="color: #3b82f6;">resume.pdf</span>
                -rw-r--r--  1 ansh ansh 1024 Feb 10 02:50 skills.json
                -rw-r--r--  1 ansh ansh  512 Feb 10 02:50 contact.info
                -rw-r--r--  1 ansh ansh  256 Feb 10 02:50 status.txt
                drwxr-xr-x  3 ansh ansh 4096 Feb 10 02:50 <span class="highlight">experience/</span>
                drwxr-xr-x  2 ansh ansh 4096 Feb 10 02:50 <span class="highlight">education/</span>
            </div>
        `;
        this.addOutput(lsText);
    }

    showPath() {
        this.addOutput('<div class="success">/home/ansh/portfolio</div>');
    }

    catFile() {
        this.addOutput('<div class="error">cat: Please specify a filename. Try: cat resume.pdf</div>');
    }

    clearTerminal() {
        this.output.innerHTML = '';
        document.querySelector('.welcome-section').style.display = 'block';
    }
}

// Initialize the terminal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const terminal = new PortfolioTerminal();

    // Debug: Check if everything is working
    setTimeout(() => {
        const input = document.getElementById('terminal-input');
        console.log('Input after init:', input);
        console.log('Input disabled:', input.disabled);
        console.log('AI typing status:', terminal.aiTyping);

        // Force focus again if needed
        if (input && !input.disabled) {
            input.focus();
            console.log('Input focused');
        }
    }, 1000);
});
