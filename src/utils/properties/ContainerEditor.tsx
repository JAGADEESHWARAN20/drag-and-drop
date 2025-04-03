// ContainerEditor.tsx
import React from 'react';
import { Breakpoint } from '../../store/WebsiteStore';
import { TextInput, ColorPicker } from './PropertyEditorUtils';

interface ContainerProps {
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  borderRadius?: string;
  maxWidth?: string;
}

interface ContainerEditorProps {
  props: ContainerProps;
  onChange: (key: keyof ContainerProps, value: any, isResponsive?: boolean) => void;
  breakpoint: Breakpoint;
}

export const ContainerEditor = ({
  props,
  onChange,
  breakpoint,
}: ContainerEditorProps) => {
  const isResponsive = breakpoint !== 'desktop';

  return (
    <div>
      <TextInput
        label="Padding"
        value={props.padding || '16px'}
        onChange={(value) => onChange('padding', value, isResponsive)}
        isResponsive={isResponsive}
      />
      <TextInput
        label="Margin"
        value={props.margin || '0'}
        onChange={(value) => onChange('margin', value, isResponsive)}
        isResponsive={isResponsive}
      />
      <ColorPicker
        label="Background Color"
        value={props.backgroundColor || '#ffffff'}
        onChange={(value) => onChange('backgroundColor', value)}
      />
      <TextInput
        label="Border Radius"
        value={props.borderRadius || '0'}
        onChange={(value) => onChange('borderRadius', value)}
      />
      <TextInput
        label="Max Width"
        value={props.maxWidth || '1200px'}
        onChange={(value) => onChange('maxWidth', value, isResponsive)}
        isResponsive={isResponsive}
      />
    </div>
  );
};