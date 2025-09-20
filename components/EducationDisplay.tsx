'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Calendar } from 'lucide-react';
import { Education } from '@/lib/data';

interface EducationDisplayProps {
  education: Education;
}

export const EducationDisplay: React.FC<EducationDisplayProps> = ({ education }) => {
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
              <GraduationCap className="w-4 h-4 text-terminal-green" />
              <h3 className="text-terminal-green font-bold text-lg">{education.degree}</h3>
            </div>
            <div className="text-terminal-text font-medium">{education.institution}</div>
          </div>
          <div className="flex items-center space-x-1 text-terminal-muted text-sm">
            <Calendar className="w-4 h-4" />
            <span>{education.duration}</span>
          </div>
        </div>

        {/* Description */}
        {education.description && (
          <div className="text-terminal-text text-sm">
            {education.description}
          </div>
        )}
      </div>
    </motion.div>
  );
};
