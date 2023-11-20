import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ISettingState {
  openAiApiKey: string;
  setOpenAiApiKey: (apiKey: string) => void;
}

const useSettingStore = create<ISettingState>()(
  devtools(
    persist(
      (set) => ({
        openAiApiKey: '',
        setOpenAiApiKey: (apiKey) => set({ openAiApiKey: apiKey }),
      }),
      {
        name: 'setting-storage',
      }
    )
  )
);
export default useSettingStore;
