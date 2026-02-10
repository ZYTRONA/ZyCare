import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  login: (userData) => set({ user: userData, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),
}));

export const useTicketStore = create((set) => ({
  currentTicket: null,
  ticketQueue: [],
  setCurrentTicket: (ticket) => set({ currentTicket: ticket }),
  setTicketQueue: (queue) => set({ ticketQueue: queue }),
  addTicketToQueue: (ticket) => set((state) => ({ 
    ticketQueue: [...state.ticketQueue, ticket] 
  })),
  removeTicketFromQueue: (ticketId) => set((state) => ({ 
    ticketQueue: state.ticketQueue.filter(t => t.ticketId !== ticketId) 
  })),
}));

export const useSocketStore = create((set) => ({
  socket: null,
  connected: false,
  setSocket: (socket) => set({ socket, connected: true }),
  disconnect: () => set((state) => {
    if (state.socket) {
      state.socket.disconnect();
    }
    return { socket: null, connected: false };
  }),
}));

export const useChatStore = create((set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, { ...message, timestamp: new Date() }] 
  })),
  clearMessages: () => set({ messages: [] }),
}));

export const useLanguageStore = create((set, get) => ({
  language: 'en',
  setLanguage: (language) => set({ language }),
  getLanguage: () => get().language,
}));
