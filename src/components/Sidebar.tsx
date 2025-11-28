import React from 'react';
import { Plus, MessageSquare, Trash2, Github } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { clsx } from 'clsx';

export const Sidebar: React.FC = () => {
    const { sessions, currentSessionId, createSession, switchSession, clearSession } = useStore();

    return (
        <div className="h-full flex flex-col bg-gray-900 text-gray-300 w-64 flex-shrink-0 border-r border-gray-800">
            <div className="p-4">
                <div className="flex items-center gap-2 mb-6 px-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        G
                    </div>
                    <h1 className="text-lg font-bold text-white tracking-tight">Gravity Check</h1>
                </div>

                <button
                    onClick={() => createSession()}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 font-medium"
                >
                    <Plus size={18} />
                    New Chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-1">
                <div className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Recent Sessions
                </div>
                {sessions.map((session) => (
                    <button
                        key={session.id}
                        onClick={() => switchSession(session.id)}
                        className={clsx(
                            "w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-colors text-left group",
                            currentSessionId === session.id
                                ? "bg-gray-800 text-white"
                                : "hover:bg-gray-800/50 text-gray-400 hover:text-gray-200"
                        )}
                    >
                        <MessageSquare size={16} className={currentSessionId === session.id ? "text-blue-400" : "text-gray-600"} />
                        <span className="truncate flex-1">{session.title}</span>
                        {currentSessionId === session.id && (
                            <div
                                onClick={(e) => { e.stopPropagation(); clearSession(session.id); }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                                title="Clear Chat"
                            >
                                <Trash2 size={14} />
                            </div>
                        )}
                    </button>
                ))}
                {sessions.length === 0 && (
                    <div className="px-4 py-8 text-center text-xs text-gray-600">
                        No active sessions.
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3 text-xs text-gray-500 px-2">
                    <Github size={14} />
                    <span>Powered by Gemini 1.5 Flash</span>
                </div>
            </div>
        </div>
    );
};
