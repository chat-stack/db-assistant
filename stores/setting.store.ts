import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ISettingState {
  openAiApiKey: string;
  setOpenAiApiKey: (apiKey: string) => void;
  postgresUser: string;
  setPostgresUser: (user: string) => void;
  postgresHost: string;
  setPostgresHost: (host: string) => void;
  postgresDatabase: string;
  setPostgresDatabase: (database: string) => void;
  postgresPassword: string;
  setPostgresPassword: (password: string) => void;
  postgresPort: string;
  setPostgresPort: (port: string) => void;
  assistantId: string;
  setAssistantId: (id: string) => void;
}

const useSettingStore = create<ISettingState>()(
  devtools(
    persist(
      (set) => ({
        openAiApiKey: '',
        setOpenAiApiKey: (apiKey) => set({ openAiApiKey: apiKey }),
        postgresUser: '',
        setPostgresUser: (user) => set({ postgresUser: user }),
        postgresHost: '',
        setPostgresHost: (host) => set({ postgresHost: host }),
        postgresDatabase: '',
        setPostgresDatabase: (database) => set({ postgresDatabase: database }),
        postgresPassword: '',
        setPostgresPassword: (password) => set({ postgresPassword: password }),
        postgresPort: '5432',
        setPostgresPort: (port) => set({ postgresPort: port }),
        assistantId: '',
        setAssistantId: (id) => set({ assistantId: id }),
      }),
      {
        name: 'setting-storage',
      }
    )
  )
);

export default useSettingStore;
