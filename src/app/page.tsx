"use client";

import { useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatPanel } from '@/components/ChatPanel';
import { NotesPanel } from '@/components/NotesPanel';
import { useStore } from '@/store/useStore';

export default function Home() {
  const { sessions, createSession } = useStore();

  useEffect(() => {
    if (sessions.length === 0) {
      createSession();
    }
  }, [sessions.length, createSession]);

  return (
    <main className="flex h-full w-full overflow-hidden">
      {/* Sidebar - Hidden on mobile, visible on md+ */}
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex h-full relative">
        {/* Chat Panel - Always visible */}
        <div className="flex-1 h-full min-w-0">
          <ChatPanel />
        </div>

        {/* Notes Panel - Hidden on small screens, visible on lg+ */}
        {/* For MVP, let's make it a fixed width on the right for large screens */}
        <div className="hidden lg:block w-80 h-full border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <NotesPanel />
        </div>
      </div>
    </main>
  );
}
