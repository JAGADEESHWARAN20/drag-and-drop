// ParagraphEditor.tsx
import React from 'react';
import { Breakpoint } from '../../store/WebsiteStore';
import { TextInput, SelectInput, ColorPicker } from './PropertyEditorUtils';

interface ParagraphProps {
  text?: string;
  textAlign?: string;
  color?: string;
}

interface ParagraphEditorProps {
  props: ParagraphProps;
  onChange: (key: keyof ParagraphProps, value: any, isResponsive?: boolean) => void;
  breakpoint: Breakpoint;
}

export const ParagraphEditor = ({
  props,
  onChange,
  breakpoint,
}: ParagraphEditorProps) => {
  const isResponsive = breakpoint !== 'desktop';

  return (
    <div>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1 text-gray-700">Text</label>
        <textarea
          value={props.text || ''}
          onChange={(e) => onChange('text', e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
          rows={4}
        />
      </div>
      <SelectInput
        label="Text Align"
        value={props.textAlign || 'left'}
        onChange={(value) => onChange('textAlign', value, isResponsive)}
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
        onChange={(value) => onChange('color', value)}
      />
    </div>
  );
};