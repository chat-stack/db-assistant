import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ISettingState {
  chatGptApiKey: string;
  maxTokens: number;
  setChatGptApiKey: (apiKey: string) => void;
  setMaxTokens: (maxTokens: number) => void;
}

const useSettingStore = create<ISettingState>()(
  devtools(
    persist(
      (set) => ({
        chatGptApiKey: '',
        setChatGptApiKey: (apiKey) => set({ chatGptApiKey: apiKey }),
        maxTokens: 256,
        setMaxTokens: (maxTokens) => set({ maxTokens }),
      }),
      {
        name: 'setting-storage',
      }
    )
  )
);
export default useSettingStore;
