import { IUIComponent } from './ui-component';

export interface IPrompt {
  name: string;
  handle: string;
  content: string;
  variables: {
    [variableName: string]: IUIComponent;
  };
}
