'use client';

import React from 'react';
import { personalInfo, projects, skills, experience, education, certifications, commands } from '@/lib/data';
import { ProjectCard } from './ProjectCard';
import { SkillDisplay } from './SkillDisplay';
import { ExperienceDisplay } from './ExperienceDisplay';
import { EducationDisplay } from './EducationDisplay';
import { CertificationDisplay } from './CertificationDisplay';
import { ContactDisplay } from './ContactDisplay';

export class CommandProcessor {
  static processCommand(input: string): React.ReactNode {
    const [command, ...args] = input.trim().split(' ');
    const lowerCommand = command.toLowerCase();

    switch (lowerCommand) {
      case 'help':
        return this.showHelp(args);
      
      case 'about':
        return this.showAbout();
      
      case 'projects':
        return this.showProjects(args);
      
      case 'skills':
        return this.showSkills(args);
      
      case 'experience':
      case 'exp':
        return this.showExperience();
      
      case 'education':
      case 'edu':
        return this.showEducation();
      
      case 'certifications':
      case 'certs':
        return this.showCertifications();
      
      case 'contact':
        return this.showContact();
      
      case 'clear':
        return this.clearTerminal();
      
      case 'whoami':
        return this.showWhoAmI();
      
      case 'date':
        return this.showDate();
      
      case 'ai':
        return this.showAIResponse(args);
      
      case 'ls':
        return this.showDirectoryListing();
      
      case 'pwd':
        return this.showCurrentDirectory();
      
      case 'echo':
        return this.echo(args);
      
      default:
        return this.showCommandNotFound(command);
    }
  }

  private static showHelp(args: string[]): React.ReactNode {
    if (args.length > 0) {
      const command = args[0].toLowerCase();
      if (commands[command as keyof typeof commands]) {
        const cmd = commands[command as keyof typeof commands];
        return (
          <div className="space-y-2">
            <div className="text-terminal-green font-bold">Command: {command}</div>
            <div className="text-terminal-text">Description: {cmd.description}</div>
            <div className="text-terminal-text">Usage: {cmd.usage}</div>
          </div>
        );
      } else {
        return <div className="text-red-400">Command '{command}' not found. Type 'help' to see available commands.</div>;
      }
    }

    return (
      <div className="space-y-4">
        <div className="text-terminal-green font-bold text-lg">Available Commands:</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(commands).map(([cmd, info]) => (
            <div key={cmd} className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-terminal-green font-mono">{cmd}</span>
                <span className="text-terminal-muted">-</span>
                <span className="text-terminal-text text-sm">{info.description}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-terminal-muted text-sm mt-4">
          Type 'help &lt;command&gt;' for detailed information about a specific command.
        </div>
      </div>
    );
  }

  private static showAbout(): React.ReactNode {
    return (
      <div className="space-y-4">
        <div className="text-terminal-green font-bold text-xl">{personalInfo.name}</div>
        <div className="text-terminal-green text-lg">{personalInfo.title}</div>
        <div className="text-terminal-text">{personalInfo.bio}</div>
        <div className="space-y-2">
          <div className="text-terminal-green font-bold">Location:</div>
          <div className="text-terminal-text">{personalInfo.location}</div>
        </div>
        <div className="space-y-2">
          <div className="text-terminal-green font-bold">Email:</div>
          <div className="text-terminal-text">{personalInfo.email}</div>
        </div>
        <div className="space-y-2">
          <div className="text-terminal-green font-bold">Social Links:</div>
          <div className="flex space-x-4">
            <a href={personalInfo.social.github} target="_blank" rel="noopener noreferrer" 
               className="text-terminal-green hover:text-terminal-darkGreen transition-colors">
              GitHub
            </a>
            <a href={personalInfo.social.linkedin} target="_blank" rel="noopener noreferrer"
               className="text-terminal-green hover:text-terminal-darkGreen transition-colors">
              LinkedIn
            </a>
            <a href={personalInfo.social.twitter} target="_blank" rel="noopener noreferrer"
               className="text-terminal-green hover:text-terminal-darkGreen transition-colors">
              Twitter
            </a>
          </div>
        </div>
      </div>
    );
  }

  private static showProjects(args: string[]): React.ReactNode {
    const isDetailed = args.includes('--detailed') || args.includes('-d');
    
    return (
      <div className="space-y-4">
        <div className="text-terminal-green font-bold text-lg">Projects ({projects.length})</div>
        <div className="space-y-4">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} isDetailed={isDetailed} />
          ))}
        </div>
        <div className="text-terminal-muted text-sm">
          Use 'projects --detailed' for more information about each project.
        </div>
      </div>
    );
  }

  private static showSkills(args: string[]): React.ReactNode {
    const category = args[0]?.toLowerCase();
    
    if (category) {
      const skillCategory = skills.find(s => s.category.toLowerCase() === category);
      if (skillCategory) {
        return (
          <div className="space-y-4">
            <div className="text-terminal-green font-bold text-lg">{skillCategory.category}</div>
            <SkillDisplay skills={skillCategory.skills} />
          </div>
        );
      } else {
        return (
          <div className="space-y-4">
            <div className="text-red-400">Category '{category}' not found.</div>
            <div className="text-terminal-green font-bold">Available categories:</div>
            <div className="text-terminal-text">
              {skills.map(s => s.category).join(', ')}
            </div>
          </div>
        );
      }
    }

    return (
      <div className="space-y-4">
        <div className="text-terminal-green font-bold text-lg">Technical Skills</div>
        <div className="space-y-4">
          {skills.map((skillCategory, index) => (
            <div key={index} className="space-y-2">
              <div className="text-terminal-green font-bold">{skillCategory.category}:</div>
              <SkillDisplay skills={skillCategory.skills} />
            </div>
          ))}
        </div>
        <div className="text-terminal-muted text-sm">
          Use 'skills &lt;category&gt;' to see skills in a specific category.
        </div>
      </div>
    );
  }

  private static showExperience(): React.ReactNode {
    return (
      <div className="space-y-4">
        <div className="text-terminal-green font-bold text-lg">Work Experience</div>
        <div className="space-y-4">
          {experience.map((exp, index) => (
            <ExperienceDisplay key={index} experience={exp} />
          ))}
        </div>
      </div>
    );
  }

  private static showEducation(): React.ReactNode {
    return (
      <div className="space-y-4">
        <div className="text-terminal-green font-bold text-lg">Education</div>
        <div className="space-y-4">
          {education.map((edu, index) => (
            <EducationDisplay key={index} education={edu} />
          ))}
        </div>
      </div>
    );
  }

  private static showCertifications(): React.ReactNode {
    return (
      <div className="space-y-4">
        <div className="text-terminal-green font-bold text-lg">Professional Certifications</div>
        <div className="space-y-4">
          {certifications.map((cert, index) => (
            <CertificationDisplay key={index} certification={cert} />
          ))}
        </div>
      </div>
    );
  }

  private static showContact(): React.ReactNode {
    return <ContactDisplay />;
  }

  private static clearTerminal(): React.ReactNode {
    // This will be handled by the parent component
    return null;
  }

  private static showWhoAmI(): React.ReactNode {
    return (
      <div className="space-y-2">
        <div className="text-terminal-green font-bold">Current User:</div>
        <div className="text-terminal-text">{personalInfo.name}</div>
        <div className="text-terminal-text text-sm text-terminal-muted">
          {personalInfo.title} | {personalInfo.location}
        </div>
      </div>
    );
  }

  private static showDate(): React.ReactNode {
    const now = new Date();
    return (
      <div className="text-terminal-text">
        {now.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        })}
      </div>
    );
  }

  private static showAIResponse(args: string[]): React.ReactNode {
    const question = args.join(' ');
    if (!question) {
      return (
        <div className="space-y-2">
          <div className="text-terminal-green font-bold">AI Assistant</div>
          <div className="text-terminal-text">Ask me anything! Try: 'ai tell me about your experience with React'</div>
        </div>
      );
    }

    // Simple AI-like responses based on keywords
    const responses = this.generateAIResponse(question);
    return (
      <div className="space-y-2">
        <div className="text-terminal-green font-bold">AI Response:</div>
        <div className="text-terminal-text">{responses}</div>
      </div>
    );
  }

  private static generateAIResponse(question: string): string {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('react') || lowerQuestion.includes('frontend')) {
      return "I have extensive experience with React, including hooks, context, and modern patterns. I've built several production applications using React with TypeScript and Next.js.";
    }
    
    if (lowerQuestion.includes('ai') || lowerQuestion.includes('machine learning')) {
      return "I'm passionate about AI and ML technologies. I've worked with TensorFlow, PyTorch, and various AI APIs. I've built ML models for computer vision and natural language processing tasks.";
    }
    
    if (lowerQuestion.includes('cloud') || lowerQuestion.includes('aws') || lowerQuestion.includes('azure')) {
      return "I'm certified in AWS and Azure cloud platforms. I have experience with containerization, microservices, and cloud-native application development.";
    }
    
    if (lowerQuestion.includes('experience') || lowerQuestion.includes('background')) {
      return "I'm a software engineer with 4+ years of experience in full-stack development. I specialize in modern web technologies, cloud platforms, and AI integration.";
    }
    
    return "That's an interesting question! Based on my experience, I'd be happy to discuss this further. Feel free to ask about my technical skills, projects, or professional background.";
  }

  private static showDirectoryListing(): React.ReactNode {
    return (
      <div className="space-y-2">
        <div className="text-terminal-green font-bold">Directory Contents:</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-terminal-text">
          {['about/', 'projects/', 'skills/', 'experience/', 'education/', 'contact/', 'README.md', 'resume.pdf'].map((item, index) => (
            <div key={index} className="flex items-center space-x-1">
              {item.endsWith('/') ? (
                <span className="text-terminal-green">📁</span>
              ) : (
                <span className="text-terminal-muted">📄</span>
              )}
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  private static showCurrentDirectory(): React.ReactNode {
    return (
      <div className="text-terminal-text">
        /home/{personalInfo.name.toLowerCase().replace(' ', '-')}/portfolio
      </div>
    );
  }

  private static echo(args: string[]): React.ReactNode {
    return <div className="text-terminal-text">{args.join(' ')}</div>;
  }

  private static showCommandNotFound(command: string): React.ReactNode {
    return (
      <div className="space-y-2">
        <div className="text-red-400">Command '{command}' not found.</div>
        <div className="text-terminal-text">Type 'help' to see available commands.</div>
      </div>
    );
  }
}
