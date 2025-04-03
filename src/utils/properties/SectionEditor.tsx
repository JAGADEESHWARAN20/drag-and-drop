import React from 'react';
import { TextInput, ColorPicker } from './PropertyEditorUtils';

interface SectionProps {
  backgroundColor?: string;
  padding?: string;
}

interface SectionEditorProps {
  props: SectionProps;
  onChange: (key: keyof SectionProps, value: any, isResponsive?: boolean) => void;
}

export const SectionEditor = ({ props, onChange }: SectionEditorProps) => {
  return (
    <div>
      <ColorPicker
        label="Background Color"
        value={props.backgroundColor || '#f9f9f9'}
        onChange={(value) => onChange('backgroundColor', value)}
      />
      <TextInput
        label="Padding"
        value={props.padding || '40px 0'}
        onChange={(value) => onChange('padding', value)}
      />
    </div>
  );
};