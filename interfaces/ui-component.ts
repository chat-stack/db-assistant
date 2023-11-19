type TUIComponentType = 'TextBox' | 'TextArea' | 'Dropdown';

export interface IUIComponent {
  displayName: string;
  type: TUIComponentType;
  defaultValue?: string;
  isRequired: boolean;
}
