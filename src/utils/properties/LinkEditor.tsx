import React from 'react';
import { TextInput, ColorPicker } from './PropertyEditorUtils';

interface LinkProps {
  text?: string;
  url?: string;
  color?: string;
}

interface LinkEditorProps {
  props: LinkProps;
  onChange: (key: keyof LinkProps, value: string, isResponsive?: boolean) => void;
}

export const LinkEditor = ({ props, onChange }: LinkEditorProps) => {
  return (
    <div>
      <TextInput
        label="Link Text"
        value={props.text || ''}
        onChange={(value) => onChange('text', value)}
      />
      <TextInput
        label="URL"
        value={props.url || '#'}
        onChange={(value) => onChange('url', value)}
      />
      <ColorPicker
        label="Color"
        value={props.color || '#0066cc'}
        onChange={(value) => onChange('color', value)}
      />
    </div>
  );
};
