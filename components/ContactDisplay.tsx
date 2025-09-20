'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Github, Linkedin, Twitter, Phone, MessageSquare } from 'lucide-react';
import { personalInfo } from '@/lib/data';

export const ContactDisplay: React.FC = () => {
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
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      label: 'Email',
      value: personalInfo.email,
      href: `mailto:${personalInfo.email}`,
      color: 'text-blue-400'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: personalInfo.location,
      href: null,
      color: 'text-red-400'
    },
    {
      icon: Github,
      label: 'GitHub',
      value: 'github.com/yourusername',
      href: personalInfo.social.github,
      color: 'text-gray-400'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      value: 'linkedin.com/in/yourusername',
      href: personalInfo.social.linkedin,
      color: 'text-blue-500'
    },
    {
      icon: Twitter,
      label: 'Twitter',
      value: '@yourusername',
      href: personalInfo.social.twitter,
      color: 'text-blue-400'
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <div className="text-terminal-green font-bold text-lg">Get In Touch</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contactMethods.map((method, index) => {
          const IconComponent = method.icon;
          
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-terminal-gray border border-terminal-green rounded-lg p-4 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-terminal-lightGray ${method.color}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-terminal-green font-medium text-sm">{method.label}</div>
                  {method.href ? (
                    <a 
                      href={method.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-terminal-text hover:text-terminal-green transition-colors text-sm"
                    >
                      {method.value}
                    </a>
                  ) : (
                    <div className="text-terminal-text text-sm">{method.value}</div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-terminal-gray border border-terminal-green rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <MessageSquare className="w-5 h-5 text-terminal-green" />
          <span className="text-terminal-green font-medium">Quick Message</span>
        </div>
        <div className="text-terminal-text text-sm">
          I'm always interested in hearing about new opportunities, interesting projects, or just having a chat about technology. 
          Feel free to reach out through any of the channels above!
        </div>
      </div>

      <div className="text-terminal-muted text-sm">
        <strong>Response Time:</strong> Usually within 24 hours
      </div>
    </motion.div>
  );
};
