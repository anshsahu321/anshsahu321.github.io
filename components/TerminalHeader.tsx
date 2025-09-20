'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, X, Minimize2, Square, Wifi, Battery, Clock } from 'lucide-react';

interface TerminalHeaderProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({ 
  onClose, 
  onMinimize, 
  onMaximize 
}) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="terminal-header flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onMinimize}
            className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-400 transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onMaximize}
            className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-400 transition-colors"
          />
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Terminal className="w-4 h-4 text-terminal-green" />
          <span className="text-terminal-text text-sm">terminal-portfolio</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* System Status */}
        <div className="flex items-center space-x-2 text-terminal-muted text-xs">
          <Wifi className="w-3 h-3" />
          <span>Connected</span>
        </div>
        
        <div className="flex items-center space-x-2 text-terminal-muted text-xs">
          <Battery className="w-3 h-3" />
          <span>100%</span>
        </div>
        
        <div className="flex items-center space-x-2 text-terminal-muted text-xs">
          <Clock className="w-3 h-3" />
          <span>{formatTime(currentTime)}</span>
        </div>
        
        {/* Window Controls */}
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onMinimize}
            className="text-terminal-muted hover:text-terminal-text transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onMaximize}
            className="text-terminal-muted hover:text-terminal-text transition-colors"
          >
            <Square className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-terminal-muted hover:text-terminal-text transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
