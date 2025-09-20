'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Code } from 'lucide-react';
import { Project } from '@/lib/data';

interface ProjectCardProps {
  project: Project;
  isDetailed?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, isDetailed = false }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="project-card"
    >
      <div className="space-y-3">
        {/* Project Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-terminal-green font-bold text-lg">{project.name}</h3>
            <p className="text-terminal-text text-sm mt-1">{project.description}</p>
          </div>
          <div className="flex space-x-2 ml-4">
            {project.githubUrl && (
              <motion.a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-terminal-muted hover:text-terminal-green transition-colors"
                title="View on GitHub"
              >
                <Github className="w-4 h-4" />
              </motion.a>
            )}
            {project.liveUrl && (
              <motion.a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-terminal-muted hover:text-terminal-green transition-colors"
                title="View Live Demo"
              >
                <ExternalLink className="w-4 h-4" />
              </motion.a>
            )}
          </div>
        </div>

        {/* Technologies */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4 text-terminal-green" />
            <span className="text-terminal-green font-medium text-sm">Technologies:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech, index) => (
              <span key={index} className="skill-tag">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Detailed Information */}
        {isDetailed && (
          <div className="space-y-2 pt-2 border-t border-terminal-lightGray">
            <div className="text-terminal-muted text-sm">
              <strong>Project ID:</strong> {project.id}
            </div>
            {project.githubUrl && (
              <div className="text-terminal-muted text-sm">
                <strong>Repository:</strong> 
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" 
                   className="text-terminal-green hover:text-terminal-darkGreen ml-1">
                  {project.githubUrl}
                </a>
              </div>
            )}
            {project.liveUrl && (
              <div className="text-terminal-muted text-sm">
                <strong>Live Demo:</strong> 
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                   className="text-terminal-green hover:text-terminal-darkGreen ml-1">
                  {project.liveUrl}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
