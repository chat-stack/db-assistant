import { create } from 'zustand';

interface IDbChatTabStore {
  activeTab: string;
  setActiveTab: (tabKey: string) => void;
}

const useDbChatTabStore = create<IDbChatTabStore>((set) => ({
  activeTab: '1',
  setActiveTab: (tabKey) => set({ activeTab: tabKey }),
}));

export default useDbChatTabStore;
