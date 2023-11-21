import { create } from 'zustand';

interface ISqlState {
  sqlQuery: string;
  setSqlQuery: (sqlQuery: string) => void;
}

const useSqlStore = create<ISqlState>((set) => ({
  sqlQuery: '',
  setSqlQuery: (sqlQuery: string) => set({ sqlQuery }),
}));

export default useSqlStore;
