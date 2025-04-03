import React from 'react';
import { Breakpoint } from '../../store/WebsiteStore';
import { TextInput, SelectInput, ColorPicker } from './PropertyEditorUtils';

interface HeadingProps {
  text?: string;
  level?: string;
  textAlign?: string;
  color?: string;
}

interface HeadingEditorProps {
  props: HeadingProps;
  onChange: (key: keyof HeadingProps, value: any, isResponsive?: boolean) => void;
  breakpoint: Breakpoint;
}

export const HeadingEditor = ({
  props,
  onChange,
  breakpoint,
}: HeadingEditorProps) => {
  const isResponsive = breakpoint !== 'desktop';

  return (
    <div>
      <TextInput
        label="Text"
        value={props.text || ''}
        onChange={(value) => onChange('text', value)}
      />
      <SelectInput
        label="Level"
        value={props.level || 'h2'}
        onChange={(value) => onChange('level', value)}
        options={[
          { value: 'h1', label: 'H1' },
          { value: 'h2', label: 'H2' },
          { value: 'h3', label: 'H3' },
          { value: 'h4', label: 'H4' },
          { value: 'h5', label: 'H5' },
          { value: 'h6', label: 'H6' },
        ]}
      />
      <SelectInput
        label="Text Align"
        value={props.textAlign || 'left'}
        onChange={(value) => onChange('textAlign', value, isResponsive)}
        options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]}
        isResponsive={isResponsive}
      />
      <ColorPicker
        label="Color"
        value={props.color || '#000000'}
        onChange={(value) => onChange('color', value)}
      />
    </div>
  );
};