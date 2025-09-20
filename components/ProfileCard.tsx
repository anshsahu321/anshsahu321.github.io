'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Github, Linkedin, Twitter } from 'lucide-react';
import { personalInfo } from '@/lib/data';

interface ProfileCardProps {
  isMobile?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ isMobile = false }) => {
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const iconVariants = {
    hover: { scale: 1.2, rotate: 5 },
    tap: { scale: 0.9 }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`profile-card ${isMobile ? 'w-64' : 'w-80'}`}
    >
      {/* Avatar */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div className="w-24 h-24 bg-terminal-green rounded-full flex items-center justify-center text-terminal-bg text-2xl font-bold">
            {personalInfo.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-terminal-bg flex items-center justify-center">
            <div className="w-2 h-2 bg-terminal-bg rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Name and Title */}
      <div className="text-center mb-4">
        <h2 className="text-terminal-green font-bold text-lg">{personalInfo.name}</h2>
        <p className="text-terminal-text text-sm">{personalInfo.title}</p>
      </div>

      {/* Contact Info */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3 text-terminal-text text-sm">
          <Mail className="w-4 h-4 text-terminal-green" />
          <span className="truncate">{personalInfo.email}</span>
        </div>
        
        <div className="flex items-center space-x-3 text-terminal-text text-sm">
          <MapPin className="w-4 h-4 text-terminal-green" />
          <span>{personalInfo.location}</span>
        </div>
      </div>

      {/* Social Links */}
      <div className="flex justify-center space-x-4 mt-6">
        <motion.a
          href={personalInfo.social.github}
          target="_blank"
          rel="noopener noreferrer"
          variants={iconVariants}
          whileHover="hover"
          whileTap="tap"
          className="text-terminal-muted hover:text-terminal-green transition-colors"
        >
          <Github className="w-5 h-5" />
        </motion.a>
        
        <motion.a
          href={personalInfo.social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          variants={iconVariants}
          whileHover="hover"
          whileTap="tap"
          className="text-terminal-muted hover:text-terminal-green transition-colors"
        >
          <Linkedin className="w-5 h-5" />
        </motion.a>
        
        <motion.a
          href={personalInfo.social.twitter}
          target="_blank"
          rel="noopener noreferrer"
          variants={iconVariants}
          whileHover="hover"
          whileTap="tap"
          className="text-terminal-muted hover:text-terminal-green transition-colors"
        >
          <Twitter className="w-5 h-5" />
        </motion.a>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center space-x-2 text-terminal-green text-xs">
          <div className="w-2 h-2 bg-terminal-green rounded-full animate-pulse"></div>
          <span>Available for opportunities</span>
        </div>
      </div>
    </motion.div>
  );
};
