import React from 'react';
import { Breakpoint } from '../../store/WebsiteStore';
import { TextInput, SelectInput, ColorPicker } from './PropertyEditorUtils';

interface ParagraphProps {
  text?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
}

interface ParagraphEditorProps {
  props: ParagraphProps;
  onChange: (key: keyof ParagraphProps, value: string, isResponsive?: boolean) => void;
  breakpoint: Breakpoint;
}

export const ParagraphEditor = ({
  props,
  onChange,
  breakpoint,
}: ParagraphEditorProps) => {
  const isResponsive = breakpoint !== 'desktop';

  const handleChange = (key: keyof ParagraphProps, value: unknown, isResponsive?: boolean) => {
    if (typeof value === 'string') {
      onChange(key, value, isResponsive);
    } else {
      console.warn(`Invalid type for ${key}: Expected string, got ${typeof value}`);
    }
  };

  return (
    <div className="dark:text-white"> {/* Added dark mode text color to the container */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Text</label> {/* Added dark mode text color to label */}
        <textarea
          value={props.text || ''}
          onChange={(e) => handleChange('text', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-slate-200 dark:bg-opacity-20 text-black dark:text-white" // Added light and dark mode styling
          rows={4}
        />
      </div>
      <SelectInput
        label="Text Align"
        value={props.textAlign || 'left'}
        onChange={(value) => handleChange('textAlign', value, isResponsive)}
        options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
          { value: 'justify', label: 'Justify' },
        ]}
        isResponsive={isResponsive}
        className="bg-white dark:bg-slate-200 dark:bg-opacity-20 text-black dark:text-white" // Added light and dark mode styling
      />
      <ColorPicker
        label="Color"
        value={props.color || '#333333'}
        onChange={(value) => handleChange('color', value)}
      />
    </div>
  );
};