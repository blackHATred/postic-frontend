export interface DialogBoxModel{
    title : string,
    text: string;
    input_placeholder: string;
    button_text: string;
    onClick: (value: string) => string;
}