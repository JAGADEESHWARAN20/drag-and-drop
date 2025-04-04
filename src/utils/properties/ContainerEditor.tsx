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
  onChange: <K extends keyof ContainerProps>(
    key: K,
    value: ContainerProps[K],
    isResponsive?: boolean
  ) => void;
  breakpoint: Breakpoint;
}

export const ContainerEditor: React.FC<ContainerEditorProps> = ({
  props,
  onChange,
  breakpoint,
}) => {
  const isResponsive = breakpoint !== 'desktop';

  return (
    <div>
      <TextInput
        label="Padding"
        value={props.padding ?? '16px'}
        onChange={(value: string) => onChange('padding', value, isResponsive)}
        isResponsive={isResponsive}
      />
      <TextInput
        label="Margin"
        value={props.margin ?? '0'}
        onChange={(value: string) => onChange('margin', value, isResponsive)}
        isResponsive={isResponsive}
      />
      <ColorPicker
        label="Background Color"
        value={props.backgroundColor ?? '#ffffff'}
        onChange={(value: string) => onChange('backgroundColor', value)}
      />
      <TextInput
        label="Border Radius"
        value={props.borderRadius ?? '0'}
        onChange={(value: string) => onChange('borderRadius', value)}
      />
      <TextInput
        label="Max Width"
        value={props.maxWidth ?? '1200px'}
        onChange={(value: string) => onChange('maxWidth', value, isResponsive)}
        isResponsive={isResponsive}
      />
    </div>
  );
};
