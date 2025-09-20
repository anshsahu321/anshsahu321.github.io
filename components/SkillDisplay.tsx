'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkillDisplayProps {
  skills: string[];
}

export const SkillDisplay: React.FC<SkillDisplayProps> = ({ skills }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap gap-2"
    >
      {skills.map((skill, index) => (
        <motion.span
          key={index}
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          className="skill-tag"
        >
          {skill}
        </motion.span>
      ))}
    </motion.div>
  );
};
