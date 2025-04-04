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
    <div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-gray-700">Text</label>
        <textarea
          value={props.text || ''}
          onChange={(e) => handleChange('text', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
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
      />
      <ColorPicker
        label="Color"
        value={props.color || '#333333'}
        onChange={(value) => handleChange('color', value)}
      />
    </div>
  );
};
