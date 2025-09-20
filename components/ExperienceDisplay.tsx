'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Calendar, Code } from 'lucide-react';
import { Experience } from '@/lib/data';

interface ExperienceDisplayProps {
  experience: Experience;
}

export const ExperienceDisplay: React.FC<ExperienceDisplayProps> = ({ experience }) => {
  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-terminal-gray border border-terminal-green rounded-lg p-4"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Building2 className="w-4 h-4 text-terminal-green" />
              <h3 className="text-terminal-green font-bold text-lg">{experience.position}</h3>
            </div>
            <div className="text-terminal-text font-medium">{experience.company}</div>
          </div>
          <div className="flex items-center space-x-1 text-terminal-muted text-sm">
            <Calendar className="w-4 h-4" />
            <span>{experience.duration}</span>
          </div>
        </div>

        {/* Description */}
        <div className="text-terminal-text text-sm">
          {experience.description}
        </div>

        {/* Technologies */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4 text-terminal-green" />
            <span className="text-terminal-green font-medium text-sm">Technologies Used:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {experience.technologies.map((tech, index) => (
              <span key={index} className="skill-tag">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
