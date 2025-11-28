import React, { useState, useRef, useEffect } from 'react';
import { Send, StopCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ChatMessageBubble } from './ChatMessageBubble';
import { streamGeminiChat } from '@/lib/gemini';

export const ChatPanel: React.FC = () => {
    const {
        currentSessionId,
        getCurrentSession,
        addMessage,
        updateLastMessage,
        addNote
    } = useStore();

    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const session = getCurrentSession();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [session?.messages]);

    // Refined submit handler with correct accumulation
    const handleSend = async () => {
        if (!input.trim() || !currentSessionId || isStreaming) return;

        const userMessageContent = input;
        setInput('');
        setIsStreaming(true);

        addMessage(currentSessionId, { role: 'user', content: userMessageContent });
        addMessage(currentSessionId, { role: 'ai', content: '' });

        let fullResponse = "";

        try {
            // Build conversation history (must start with 'user' role per Gemini API requirements)
            const history = (session?.messages || []).map(m => ({
                role: (m.role === 'user' ? 'user' : 'model') as "user" | "model",
                parts: [{ text: m.content }]
            }));

            // Add note tracking context to the current user message
            const noteCount = session?.notes?.length || 0;
            const contextPrefix = noteCount > 0
                ? `[Context: You have created ${noteCount} note(s) in this conversation so far. Remember this when answering.]\n\n`
                : '';

            const messageWithContext = contextPrefix + userMessageContent;

            await streamGeminiChat(
                history,
                messageWithContext,
                (chunk) => {
                    fullResponse += chunk; // Accumulate full text
                    updateLastMessage(currentSessionId, fullResponse);
                },
                (note) => {
                    addNote(currentSessionId, note);
                }
            );
        } catch (error) {
            console.error(error);
            updateLastMessage(currentSessionId, fullResponse + "\n\n[Error: Connection interrupted]");
        } finally {
            setIsStreaming(false);
        }
    };

    if (!currentSessionId) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-400">
                Select or create a chat to begin.
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900 relative">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {session?.messages.map((msg) => (
                    <ChatMessageBubble key={msg.id} message={msg} />
                ))}
                {session?.messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                        <p>Start chatting with Gemini...</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="max-w-4xl mx-auto relative flex items-center"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full p-4 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 outline-none transition-all"
                        disabled={isStreaming}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isStreaming}
                        className="absolute right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isStreaming ? <StopCircle size={20} className="animate-pulse" /> : <Send size={20} />}
                    </button>
                </form>
                <div className="text-center mt-2 text-xs text-gray-400">
                    Gemini can make mistakes. Review generated notes.
                </div>
            </div>
        </div>
    );
};
