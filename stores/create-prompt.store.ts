import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { IPrompt } from '@/interfaces/prompt.interface';
import extractVariables from '@/utils/mustache';

import { IUIComponent } from '../interfaces/ui-component';

export interface IPromptInputStep1 {
  name: string;
  handle: string;
  content: string;
}

export interface IPromptInputStep2 {
  [variableName: string]: IUIComponent;
}

interface ICreatePromptState {
  promptInputStep1: IPromptInputStep1;
  promptVariables?: string[];
  prompt: IPrompt;
  setPromptInputStep1: (promptInput: IPromptInputStep1) => void;
  setPromptInputStep2: (promptInput: IPromptInputStep2) => void;
  reset: () => void;
}

const useCreatePromptStore = create<ICreatePromptState>()(
  devtools(
    persist(
      (set) => {
        const promptInputStep1: IPromptInputStep1 = {
          name: '',
          handle: '',
          content: '',
        };
        return {
          promptInputStep1,
          prompt: {
            ...promptInputStep1,
            variables: {},
          },
          setPromptInputStep1: (promptInputStep1) => {
            const promptVariables = extractVariables(promptInputStep1.content);
            set({ promptInputStep1, promptVariables });
          },
          setPromptInputStep2: (promptInputStep2) => {
            set((state) => {
              return {
                prompt: {
                  ...state.promptInputStep1,
                  variables: promptInputStep2,
                },
              };
            });
          },
          reset: () => {
            set({
              promptInputStep1,
              prompt: {
                ...promptInputStep1,
                variables: {},
              },
            });
          },
        };
      },
      {
        name: 'create-prompt-storage',
      }
    )
  )
);
export default useCreatePromptStore;
