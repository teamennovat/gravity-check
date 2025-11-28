import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, Sparkles } from 'lucide-react';
import { Message } from '@/store/useStore';
import { clsx } from 'clsx';

interface ChatMessageBubbleProps {
    message: Message;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
    const isUser = message.role === 'user';

    // Strip <gravity_note> tags for display
    const displayContent = message.content
        .replace(/<gravity_note>[\s\S]*?<\/gravity_note>/g, '')
        .trim();

    // If the message was ONLY notes, displayContent might be empty.
    // In that case, we might want to show a placeholder like "Notes generated..."
    const showContent = displayContent.length > 0 ? displayContent : (
        message.role === 'ai' ? "*Notes generated in side panel*" : message.content
    );

    return (
        <div className={clsx(
            "flex w-full mb-6",
            isUser ? "justify-end" : "justify-start"
        )}>
            <div className={clsx(
                "flex max-w-[80%] md:max-w-[70%]",
                isUser ? "flex-row-reverse" : "flex-row"
            )}>
                {/* Avatar */}
                <div className={clsx(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mx-2",
                    isUser ? "bg-blue-600" : "bg-emerald-600"
                )}>
                    {isUser ? <User size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
                </div>

                {/* Bubble */}
                <div className={clsx(
                    "p-4 rounded-2xl shadow-sm",
                    isUser
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-sm"
                )}>
                    <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                        <ReactMarkdown>{showContent}</ReactMarkdown>
                    </div>

                    {/* Source / Metadata */}
                    {!isUser && message.source && (
                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center text-xs text-gray-400">
                            <Sparkles size={12} className="mr-1" />
                            <span>Source: {message.source}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
