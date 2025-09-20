'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { personalInfo, commands } from '@/lib/data';
import { CommandProcessor } from './CommandProcessor';
import { ProfileCard } from './ProfileCard';
import { TerminalHeader } from './TerminalHeader';
import { MatrixBackground } from './MatrixBackground';

interface TerminalProps {
  className?: string;
}

export const Terminal: React.FC<TerminalProps> = ({ className = '' }) => {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [outputHistory, setOutputHistory] = useState<Array<{ command: string; output: React.ReactNode; timestamp: Date }>>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Welcome message
  useEffect(() => {
    const welcomeMessage = (
      <div className="space-y-2">
        <div className="glow-text text-lg font-bold">
          Welcome to {personalInfo.name}'s Terminal Portfolio
        </div>
        <div className="text-terminal-muted">
          AI-powered interactive portfolio terminal
        </div>
        <div className="text-terminal-green">
          Type 'help' to see available commands or 'about' to learn more about me.
        </div>
        <div className="text-terminal-muted text-sm">
          Last login: {new Date().toLocaleString()}
        </div>
      </div>
    );

    setOutputHistory([{
      command: '',
      output: welcomeMessage,
      timestamp: new Date()
    }]);
  }, []);

  // Auto-focus on terminal
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Scroll to bottom when new output is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [outputHistory]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCommand.trim()) return;

    const command = currentCommand.trim().toLowerCase();
    const newHistory = [...commandHistory, currentCommand];
    setCommandHistory(newHistory);
    setHistoryIndex(-1);

    // Process command
    const output = CommandProcessor.processCommand(currentCommand);
    setOutputHistory(prev => [...prev, {
      command: currentCommand,
      output,
      timestamp: new Date()
    }]);

    setCurrentCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Auto-complete logic could go here
    }
  };

  const clearTerminal = () => {
    setOutputHistory([]);
  };

  return (
    <div className={`min-h-screen bg-terminal-bg ${className}`}>
      {/* Matrix Background */}
      <MatrixBackground />
      
      {/* Profile Card */}
      <div className="fixed left-4 top-4 z-10 hidden lg:block">
        <ProfileCard />
      </div>

      {/* Terminal Window */}
      <div className="terminal-window max-w-4xl mx-auto mt-8 lg:mt-16 relative z-10">
        {/* Terminal Header */}
        <TerminalHeader />

        {/* Terminal Body */}
        <div 
          ref={terminalRef}
          className="terminal-body max-h-[80vh] overflow-y-auto"
          onClick={() => inputRef.current?.focus()}
        >
          {/* Output History */}
          <div className="space-y-4">
            <AnimatePresence>
              {outputHistory.map((entry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {entry.command && (
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-terminal-green">$</span>
                      <span className="text-terminal-text">{entry.command}</span>
                    </div>
                  )}
                  <div className="command-output ml-4">
                    {entry.output}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Command Input */}
          <form onSubmit={handleCommandSubmit} className="mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-terminal-green">$</span>
              <input
                ref={inputRef}
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="command-input flex-1"
                placeholder="Type a command..."
                autoComplete="off"
                spellCheck="false"
              />
              {isFocused && (
                <span className="cursor text-terminal-green"></span>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Profile Card */}
      <div className="lg:hidden fixed bottom-4 right-4 z-10">
        <ProfileCard isMobile />
      </div>
    </div>
  );
};
