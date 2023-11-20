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
        postgresPort: '',
        setPostgresPort: (port) => set({ postgresPort: port }),
      }),
      {
        name: 'setting-storage',
      }
    )
  )
);

export default useSettingStore;
