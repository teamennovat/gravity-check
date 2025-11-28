import { create } from 'zustand';


export type Role = 'user' | 'ai';

export interface Message {
  id: string;
  role: Role;
  content: string;
  source?: string | null;
  timestamp: number;
  isStreaming?: boolean;
}

export interface Note {
  id: string;
  chatId: string;
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  notes: Note[];
  createdAt: number;
}

interface AppState {
  sessions: ChatSession[];
  currentSessionId: string | null;

  // Actions
  createSession: () => string;
  switchSession: (sessionId: string) => void;
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLastMessage: (sessionId: string, content: string) => void;
  addNote: (sessionId: string, content: string) => void;
  clearSession: (sessionId: string) => void;
  getCurrentSession: () => ChatSession | undefined;
}

export const useStore = create<AppState>((set, get) => ({
  sessions: [],
  currentSessionId: null,

  createSession: () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: `New Chat ${new Date().toLocaleTimeString()}`,
      messages: [],
      notes: [],
      createdAt: Date.now(),
    };

    set((state) => ({
      sessions: [newSession, ...state.sessions],
      currentSessionId: newSession.id,
    }));

    return newSession.id;
  },

  switchSession: (sessionId) => {
    set({ currentSessionId: sessionId });
  },

  addMessage: (sessionId, message) => {
    set((state) => ({
      sessions: state.sessions.map((session) => {
        if (session.id === sessionId) {
          return {
            ...session,
            messages: [
              ...session.messages,
              {
                ...message,
                id: crypto.randomUUID(),
                timestamp: Date.now(),
              },
            ],
          };
        }
        return session;
      }),
    }));
  },

  updateLastMessage: (sessionId, content) => {
    set((state) => ({
      sessions: state.sessions.map((session) => {
        if (session.id === sessionId && session.messages.length > 0) {
          const lastMsg = session.messages[session.messages.length - 1];
          const updatedMessages = [...session.messages];
          updatedMessages[session.messages.length - 1] = {
            ...lastMsg,
            content,
            isStreaming: true, // Assume streaming if updating
          };
          return { ...session, messages: updatedMessages };
        }
        return session;
      }),
    }));
  },

  addNote: (sessionId, content) => {
    set((state) => ({
      sessions: state.sessions.map((session) => {
        if (session.id === sessionId) {
          return {
            ...session,
            notes: [
              ...session.notes,
              {
                id: crypto.randomUUID(),
                chatId: sessionId,
                content,
                timestamp: Date.now(),
              },
            ],
          };
        }
        return session;
      }),
    }));
  },

  clearSession: (sessionId) => {
    set((state) => ({
      sessions: state.sessions.map((session) => {
        if (session.id === sessionId) {
          return { ...session, messages: [], notes: [] };
        }
        return session;
      }),
    }));
  },

  getCurrentSession: () => {
    const { sessions, currentSessionId } = get();
    return sessions.find((s) => s.id === currentSessionId);
  },
}));
