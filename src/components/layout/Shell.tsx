import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { motion, AnimatePresence } from 'motion/react';

interface ShellProps {
  children: (activeTab: string) => React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const [activeTab, setActiveTab ] = useState('dashboard');

  return (
    <div className="flex bg-[#F9F9FB] min-h-screen text-[#141414] font-sans selection:bg-purple-100">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto max-h-screen relative bg-[#F9F9FB]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="p-10 lg:p-14"
          >
            {children(activeTab)}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
