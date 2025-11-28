import React from 'react';
import { useStore } from '@/store/useStore';
import ReactMarkdown from 'react-markdown';
import { FileText, Clock } from 'lucide-react';
import { clsx } from 'clsx';

export const NotesPanel: React.FC = () => {
    const { getCurrentSession } = useStore();
    const session = getCurrentSession();
    const notes = session?.notes || [];

    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <FileText size={18} className="text-blue-500" />
                    Smart Notes
                </h2>
                <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                    {notes.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400 p-4">
                        <FileText size={48} className="mb-4 opacity-20" />
                        <p className="text-sm">No notes yet.</p>
                        <p className="text-xs mt-2 opacity-70">Ask Gemini to summarize something or create a list to see notes appear here.</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <div
                            key={note.id}
                            className="group relative p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-xl shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                {/* Future: Copy/Delete buttons */}
                            </div>

                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2">
                                <ReactMarkdown>{note.content}</ReactMarkdown>
                            </div>

                            <div className="mt-3 pt-2 border-t border-yellow-100 dark:border-yellow-900/30 flex items-center text-[10px] text-gray-400">
                                <Clock size={10} className="mr-1" />
                                {new Date(note.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
