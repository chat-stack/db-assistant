import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { IPrompt } from '@/interfaces/prompt.interface';

interface IPromptsState {
  promptsState: Record<string, IPrompt>;
  setPrompt: (prompt: IPrompt) => void;
  deletePrompt: (name: string) => void;
}

const usePromptsStore = create<IPromptsState>()(
  devtools(
    persist(
      (set) => ({
        promptsState: {
          'simple-translator-prompt': {
            name: 'Simple Translator Prompt',
            handle: 'simple-translator-prompt',
            content: 'Translate any user input from {{fromLang}} to {{toLang}}',
            variables: {
              fromLang: {
                displayName: 'Translate From',
                type: 'TextBox',
                defaultValue: 'English',
                isRequired: true,
              },
              toLang: {
                displayName: 'Translate To',
                type: 'TextBox',
                defaultValue: 'Chinese',
                isRequired: true,
              },
            },
          },
        },
        setPrompt: (prompt: IPrompt) => {
          set((state) => ({
            promptsState: {
              ...state.promptsState,
              [prompt.handle]: prompt,
            },
          }));
        },
        deletePrompt: (handle: string) => {
          set((state) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [handle]: deletedPrompt, ...rest } = state.promptsState;
            return { promptsState: rest };
          });
        },
      }),
      {
        name: 'prompts-storage',
      }
    )
  )
);
export default usePromptsStore;
