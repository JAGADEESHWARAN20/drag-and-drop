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
    <div className="dark:text-white"> {/* Added dark mode text color to the container */}
      <TextInput
        label="Link Text"
        value={props.text || ''}
        onChange={(value) => onChange('text', value)}
        className="bg-white dark:bg-slate-200 dark:bg-opacity-20 text-black dark:text-white" // Added light and dark mode styling
      />
      <TextInput
        label="URL"
        value={props.url || '#'}
        onChange={(value) => onChange('url', value)}
        className="bg-white dark:bg-slate-200 dark:bg-opacity-20 text-black dark:text-white" // Added light and dark mode styling
      />
      <ColorPicker
        label="Color"
        value={props.color || '#0066cc'}
        onChange={(value) => onChange('color', value)}
      />
    </div>
  );
};