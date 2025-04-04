import { TextInput, SelectInput } from './PropertyEditorUtils';

interface FormProps {
  submitText?: string;
  action?: string;
  method?: 'GET' | 'POST';
}

interface FormEditorProps {
  props: FormProps;
  onChange: <K extends keyof FormProps>(
    key: K,
    value: FormProps[K],
    isResponsive?: boolean
  ) => void;
}

export const FormEditor = ({ props, onChange }: FormEditorProps) => {
  return (
    <div>
      <TextInput
        label="Submit Text"
        value={props.submitText ?? 'Submit'}
        onChange={(value: string) => onChange('submitText', value)}
      />
      <TextInput
        label="Form Action"
        value={props.action ?? ''}
        onChange={(value: string) => onChange('action', value)}
      />
      <SelectInput
        label="Method"
        value={props.method ?? 'POST'}
        options={[
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
        ]}
        onChange={(value: 'GET' | 'POST') => onChange('method', value)}
      />
    </div>
  );
};
