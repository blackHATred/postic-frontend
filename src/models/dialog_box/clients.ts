export interface DialogBoxModelWith1 {
  title: string;
  text: string;
  input_placeholder: string;
  button_text: string;
  onDialogClick: (value: string) => string;
  OnCloseClick: () => void;
}

export interface DialogBoxModelWith2 {
  title: string;
  text: string;
  input_placeholder1: string;
  input_placeholder2: string;
  input_placeholder3: string;
  button_text: string;
  onDialogClick: (value1: string, value2: string, value3: string) => string;
  OnCloseClick: () => void;
}
