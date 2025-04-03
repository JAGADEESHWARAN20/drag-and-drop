// FormEditor.tsx
import React from 'react';
import { TextInput, SelectInput } from './PropertyEditorUtils';

interface FormProps {
  submitText?: string;
  action?: string;
  method?: string;
}

interface FormEditorProps {
  props: FormProps;
  onChange: (key: keyof FormProps, value: any, isResponsive?: boolean) => void;
}

export const FormEditor = ({ props, onChange }: FormEditorProps) => {
  return (
    <div>
      <TextInput
        label="Submit Text"
        value={props.submitText || 'Submit'}
        onChange={(value) => onChange('submitText', value)}
      />
      <TextInput
        label="Form Action"
        value={props.action || ''}
        onChange={(value) => onChange('action', value)}
      />
      <SelectInput
        label="Method"
        value={props.method || 'POST'}
        options={[
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
        ]}
        onChange={(value) => onChange('method', value)}
      />
    </div>
  );
};